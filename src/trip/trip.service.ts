import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AirportService } from '../airport/airport.service';
import { TripRequestInput, TripStatus } from '../common/interfaces/trip.interface';
import { DistanceUtil } from '../common/utils/distance.util';
import { SpaceshipService } from '../spaceship/spaceship.service';
import { CreateTripInput } from './dto/create-trip.input';
import { TripQueueService } from './queue/trip-queue.service';
import { Trip } from './trip.entity';
import { TripGateway } from './trip.gateway';

@Injectable()
export class TripService {
    createTrip(data: TripRequestInput) {
        throw new Error('Method not implemented.');
    }
    constructor(
        @InjectRepository(Trip)
        private readonly tripRepository: Repository<Trip>,
        private readonly airportService: AirportService,
        private readonly spaceshipService: SpaceshipService,
        private readonly tripGateway: TripGateway,
        private readonly tripQueueService: TripQueueService
    ) {}

    async requestTrip(input: CreateTripInput): Promise<TripStatus> {
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
            id: uuidv4(),
            departureLocationCode: input.departureLocationCode,
            destinationLocationCode: input.destinationLocationCode,
            departureAt: new Date(input.departureAt!),
            arrivalAt,
            spaceshipId: spaceship.id,
            status: 'SCHEDULED',
        });

        const savedTrip = await this.tripRepository.save(trip);
        if (!input.destinationLocationCode) {
            throw new NotFoundException('Invalid destination airport');
        }
        if (!input.destinationLocationCode) {
            throw new NotFoundException('Invalid destination airport');
        }
        await this.spaceshipService.updateLocation(spaceship.id, input.destinationLocationCode!);
        this.tripGateway.notifyTripStatus(savedTrip as Trip);

        return { ...savedTrip, status: savedTrip.status as TripStatus['status'] };
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

    async cancelTrip(id: string): Promise<TripStatus> {
        const trip = await this.tripRepository.findOne({ where: { id } });
        if (!trip) {
            throw new NotFoundException('Trip not found');
        }
        trip.status = 'CANCELLED';
        const updatedTrip = await this.tripRepository.save(trip);
        this.tripGateway.notifyTripStatus(updatedTrip);
        return { ...updatedTrip, status: 'CANCELLED' as TripStatus['status'] };
    }

    async cancelTripAsync(id: string): Promise<string> {
        return this.tripQueueService.addCancelTripJob(id);
    }

    async getTripStatus(id: string): Promise<TripStatus> {
        const trip = await this.tripRepository.findOne({ where: { id } });
        if (!trip) {
            throw new NotFoundException('Trip not found');
        }
        return { ...trip, status: trip.status as TripStatus['status'] };
    }
}
