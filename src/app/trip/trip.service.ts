import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4, validate } from 'uuid';
import { DistanceUtil } from '../../common/utils/distance.util';
import { AirportService } from '../airport/airport.service';
import { SpaceshipService } from '../spaceship/spaceship.service';
import { CreateTripInput } from './dto/create-trip.input';
import { TripRequestInput, TripStatus } from './interface/trip.interface';
import { TripQueueService } from './queue/trip-queue.service';
import { Trip } from './trip.entity';
import { TripGateway } from './trip.gateway';

@Injectable()
export class TripService {
    logger: Logger = new Logger(TripService.name);
    constructor(
        @InjectRepository(Trip)
        private readonly tripRepository: Repository<Trip>,
        private readonly airportService: AirportService,
        private readonly spaceshipService: SpaceshipService,
        private readonly tripGateway: TripGateway,
        private readonly tripQueueService: TripQueueService
    ) {}

    async createTrip(data: TripRequestInput): Promise<Trip> {
        this.logger.log('Creating trip with data:', data);

        const input = new TripRequestInput();
        Object.assign(input, data);
        const errors: any = await validate(input);
        if (errors.length > 0) {
            this.logger.error(`Validation failed: ${JSON.stringify(errors)}`);
            throw new BadRequestException('Invalid trip request input');
        }

        const departureAirport = await this.airportService.findByLocation(
            data.departureLocationCode
        );
        const destinationAirport = await this.airportService.findByLocation(
            data.destinationLocationCode
        );
        if (!departureAirport || !destinationAirport) {
            this.logger.error(
                `Invalid airport code: departure=${data.departureLocationCode}, destination=${data.destinationLocationCode}`
            );
            throw new BadRequestException('Invalid airport code');
        }

        const spaceships = await this.spaceshipService.findAvailable(
            data.departureLocationCode ?? '',
            new Date(data.departureAt!)
        );
        if (!spaceships || spaceships.length === 0) {
            this.logger.error(
                `No available spaceship at ${data.departureAt} from ${data.departureLocationCode}`
            );
            throw new BadRequestException('No available spaceship');
        }
        const spaceship = spaceships[0];

        const distance = this.calculateDistance(departureAirport, destinationAirport);
        const duration = (distance / 1000) * 60 * 60 * 1000;
        const arrivalAt = new Date(new Date(data.departureAt!).getTime() + duration);

        const trip = this.tripRepository.create({
            departureLocationCode: data.departureLocationCode,
            destinationLocationCode: data.destinationLocationCode,
            departureAt: new Date(data.departureAt!),
            arrivalAt,
            spaceshipId: spaceship.id,
            status: 'SCHEDULED' as Trip['status'],
        });
        const savedTrip = await this.tripRepository.save(trip);
        this.tripGateway.notifyTripStatus(savedTrip);
        return savedTrip;
    }

    private calculateDistance(departure: any, destination: any): number {
        this.logger.log(`Calculating distance between ${departure.code} and ${destination.code}`);
        return 2500;
    }

    async requestTrip(input: CreateTripInput): Promise<Trip> {
        if (!input.departureLocationCode || !input.destinationLocationCode) {
            throw new NotFoundException('Invalid departure or destination airport');
        }
        const departureAirport = this.airportService.findByLocation(
            input.departureLocationCode
        ) as unknown as { latitude: number; longitude: number };
        const destinationAirport = this.airportService.findByLocation(
            input.destinationLocationCode
        ) as unknown as { latitude: number; longitude: number };

        if (departureAirport == null || destinationAirport == null) {
            throw new NotFoundException('Invalid departure or destination airport');
        }

        const spaceships = await this.spaceshipService.findAvailable(
            input.departureLocationCode,
            new Date(input.departureAt!)
        );
        if (!spaceships.length) {
            throw new NotFoundException('No spaceship available');
        }
        const spaceship = spaceships[0];

        const distance = DistanceUtil.haversineDistance(
            departureAirport.latitude!,
            departureAirport.longitude!,
            destinationAirport.latitude!,
            destinationAirport.longitude!
        );
        const travelTimeMs = DistanceUtil.calculateTravelTime(distance);
        const arrivalAt = new Date(new Date(input.departureAt!).getTime() + travelTimeMs);

        const trip = this.tripRepository.create({
            departureLocationCode: input.departureLocationCode,
            destinationLocationCode: input.destinationLocationCode,
            departureAt: new Date(input.departureAt!),
            arrivalAt,
            spaceshipId: spaceship.id,
        });
        trip.id = uuidv4();
        trip.status = 'SCHEDULED' as any;

        const savedTrip = await this.tripRepository.save(trip);
        if (!input.destinationLocationCode) {
            throw new NotFoundException('Invalid destination airport');
        }
        if (!input.destinationLocationCode) {
            throw new NotFoundException('Invalid destination airport');
        }
        await this.spaceshipService.updateLocation(spaceship.id, input.destinationLocationCode!);
        this.tripGateway.notifyTripStatus(savedTrip);

        return savedTrip;
    }

    async requestTripAsync(input: CreateTripInput): Promise<string> {
        if (!input.departureLocationCode || !input.destinationLocationCode || !input.departureAt) {
            throw new NotFoundException('Invalid trip input: missing required fields');
        }

        return this.tripQueueService.addRequestTripJob({
            ...input,
            departureLocationCode: input.departureLocationCode,
            destinationLocationCode: input.destinationLocationCode,
            departureAt: input.departureAt,
        });
    }

    async cancelTrip(id: string): Promise<Trip> {
        const trip = await this.tripRepository.findOne({ where: { id } });
        if (!trip) {
            throw new NotFoundException('Trip not found');
        }
        trip.status = 'CANCELLED' as Trip['status'];
        const updatedTrip = await this.tripRepository.save(trip);
        this.tripGateway.notifyTripStatus(updatedTrip);
        return { ...updatedTrip, status: 'CANCELLED' as Trip['status'] };
    }

    async cancelTripAsync(id: string): Promise<string> {
        return this.tripQueueService.addCancelTripJob(id);
    }

    async getTripStatus(id: string): Promise<Trip> {
        const trip = await this.tripRepository.findOne({ where: { id } });
        if (!trip) {
            throw new NotFoundException('Trip not found');
        }
        return { ...trip, status: trip.status as Trip['status'] };
    }

    async getAllTrips(
        page: number = 1,
        limit: number = 10,
        filters: { status?: TripStatus; departureLocationCode?: string } = {}
    ): Promise<{ trips: Trip[]; total: number; page: number; limit: number }> {
        this.logger.log(
            `Fetching trips with page=${page}, limit=${limit}, filters=${JSON.stringify(filters)}`
        );

        const query = this.tripRepository.createQueryBuilder('trip');
        if (filters.status) {
            query.andWhere('trip.status = :status', { status: filters.status });
        }
        if (filters.departureLocationCode) {
            query.andWhere('trip.departureLocationCode = :departureLocationCode', {
                departureLocationCode: filters.departureLocationCode,
            });
        }
        const [trips, total] = await query
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('trip.departureAt', 'DESC')
            .getManyAndCount();

        this.logger.log(`Fetched ${trips.length} trips, total: ${total}`);
        return { trips, total, page, limit };
    }
}
