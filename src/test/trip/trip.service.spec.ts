import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AirportService } from '../../airport/airport.service';
import { DistanceUtil } from '../../common/utils/distance.util';
import { SpaceshipService } from '../../spaceship/spaceship.service';
import { Trip } from '../../trip/trip.entity';
import { TripGateway } from '../../trip/trip.gateway';
import { TripService } from '../../trip/trip.service';

describe('TripService', () => {
    let tripService: TripService;
    let tripRepository: Repository<Trip>;
    let airportService: AirportService;
    let spaceshipService: SpaceshipService;
    let tripGateway: TripGateway;

    const mockTripRepository = {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
    };

    const mockAirportService = {
        findByCode: jest.fn(),
    };

    const mockSpaceshipService = {
        findAvailable: jest.fn(),
        updateLocation: jest.fn(),
    };

    const mockTripGateway = {
        notifyTripStatus: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TripService,
                {
                    provide: getRepositoryToken(Trip),
                    useValue: mockTripRepository,
                },
                {
                    provide: AirportService,
                    useValue: mockAirportService,
                },
                {
                    provide: SpaceshipService,
                    useValue: mockSpaceshipService,
                },
                {
                    provide: TripGateway,
                    useValue: mockTripGateway,
                },
            ],
        }).compile();

        tripService = module.get<TripService>(TripService);
        tripRepository = module.get<Repository<Trip>>(getRepositoryToken(Trip));
        airportService = module.get<AirportService>(AirportService);
        spaceshipService = module.get<SpaceshipService>(SpaceshipService);
        tripGateway = module.get<TripGateway>(TripGateway);
    });

    describe('requestTrip', () => {
        it('should create a trip successfully', async () => {
            const input = {
                departureLocationCode: 'JFK',
                destinationLocationCode: 'LAX',
                departureAt: '2025-01-01T00:00:00Z',
            };

            mockAirportService.findByCode
                .mockResolvedValueOnce({ location: 'JFK', latitude: 40.6413, longitude: -73.7781 })
                .mockResolvedValueOnce({
                    location: 'LAX',
                    latitude: 33.9416,
                    longitude: -118.4085,
                });
            mockSpaceshipService.findAvailable.mockResolvedValue([
                { id: 'SS-001', name: 'Galactic Voyager', location: 'JFK' },
            ]);
            jest.spyOn(DistanceUtil, 'haversineDistance').mockReturnValue(2466); // Approx distance JFK to LAX
            jest.spyOn(DistanceUtil, 'calculateTravelTime').mockReturnValue(8_871_600); // ~2.46 hours in ms
            const trip = {
                tripId: 'uuid-123',
                departureLocationCode: input.departureLocationCode,
                destinationLocationCode: input.destinationLocationCode,
                departureAt: new Date(input.departureAt),
                arrivalAt: new Date(new Date(input.departureAt).getTime() + 8_871_600),
                spaceshipId: 'SS-001',
                status: 'SCHEDULED',
            };
            mockTripRepository.create.mockReturnValue(trip);
            mockTripRepository.save.mockResolvedValue(trip);

            const result = await tripService.requestTrip(input);

            expect(result).toEqual(trip);
            expect(mockAirportService.findByCode).toHaveBeenCalledTimes(2);
            expect(mockSpaceshipService.findAvailable).toHaveBeenCalledWith(
                input.departureLocationCode,
                expect.any(Date)
            );
            expect(mockTripRepository.save).toHaveBeenCalledWith(trip);
            expect(mockSpaceshipService.updateLocation).toHaveBeenCalledWith(
                'SS-001',
                input.destinationLocationCode
            );
            expect(mockTripGateway.notifyTripStatus).toHaveBeenCalledWith(trip);
        });

        it('should throw NotFoundException if departure airport is invalid', async () => {
            const input = {
                departureLocationCode: 'INVALID',
                destinationLocationCode: 'LAX',
                departureAt: '2025-01-01T00:00:00Z',
            };

            mockAirportService.findByCode.mockResolvedValueOnce(null);

            await expect(tripService.requestTrip(input)).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException if no spaceship is available', async () => {
            const input = {
                departureLocationCode: 'JFK',
                destinationLocationCode: 'LAX',
                departureAt: '2025-01-01T00:00:00Z',
            };

            mockAirportService.findByCode
                .mockResolvedValueOnce({ location: 'JFK', latitude: 40.6413, longitude: -73.7781 })
                .mockResolvedValueOnce({
                    location: 'LAX',
                    latitude: 33.9416,
                    longitude: -118.4085,
                });
            mockSpaceshipService.findAvailable.mockResolvedValue([]);

            await expect(tripService.requestTrip(input)).rejects.toThrow(NotFoundException);
        });
    });

    describe('cancelTrip', () => {
        it('should cancel a trip successfully', async () => {
            const tripId = 'uuid-123';
            const trip = {
                tripId,
                departureLocationCode: 'JFK',
                destinationLocationCode: 'LAX',
                departureAt: new Date('2025-01-01T00:00:00Z'),
                arrivalAt: new Date('2025-01-01T02:27:51Z'),
                spaceshipId: 'SS-001',
                status: 'SCHEDULED',
            };
            mockTripRepository.findOne.mockResolvedValue(trip);
            mockTripRepository.save.mockResolvedValue({ ...trip, status: 'CANCELLED' });

            const result = await tripService.cancelTrip(tripId);

            expect(result.status).toBe('CANCELLED');
            expect(mockTripRepository.findOne).toHaveBeenCalledWith({ where: { tripId } });
            expect(mockTripRepository.save).toHaveBeenCalledWith({ ...trip, status: 'CANCELLED' });
            expect(mockTripGateway.notifyTripStatus).toHaveBeenCalledWith({
                ...trip,
                status: 'CANCELLED',
            });
        });

        it('should throw NotFoundException if trip does not exist', async () => {
            mockTripRepository.findOne.mockResolvedValue(null);

            await expect(tripService.cancelTrip('uuid-123')).rejects.toThrow(NotFoundException);
        });
    });

    describe('getTripStatus', () => {
        it('should return trip status', async () => {
            const tripId = 'uuid-123';
            const trip = {
                tripId,
                departureLocationCode: 'JFK',
                destinationLocationCode: 'LAX',
                departureAt: new Date('2025-01-01T00:00:00Z'),
                arrivalAt: new Date('2025-01-01T02:27:51Z'),
                spaceshipId: 'SS-001',
                status: 'SCHEDULED',
            };
            mockTripRepository.findOne.mockResolvedValue(trip);

            const result = await tripService.getTripStatus(tripId);

            expect(result).toEqual(trip);
            expect(mockTripRepository.findOne).toHaveBeenCalledWith({ where: { tripId } });
        });

        it('should throw NotFoundException if trip does not exist', async () => {
            mockTripRepository.findOne.mockResolvedValue(null);

            await expect(tripService.getTripStatus('uuid-123')).rejects.toThrow(NotFoundException);
        });
    });
});
