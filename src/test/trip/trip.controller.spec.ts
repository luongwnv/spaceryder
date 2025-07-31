import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateTripInput } from '../../app/trip/dto/create-trip.input';
import { TripController } from '../../app/trip/trip.controller';
import { Trip, TripStatus } from '../../app/trip/trip.entity';
import { TripService } from '../../app/trip/trip.service';

describe('TripController', () => {
    let tripController: TripController;
    let tripService: TripService;

    const mockTripService = {
        requestTrip: jest.fn(),
        cancelTrip: jest.fn(),
        getTripStatus: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TripController],
            providers: [
                {
                    provide: TripService,
                    useValue: mockTripService,
                },
            ],
        }).compile();

        tripController = module.get<TripController>(TripController);
        tripService = module.get<TripService>(TripService);
    });

    describe('requestTrip', () => {
        it('should create a trip successfully', async () => {
            const input: CreateTripInput = {
                departureLocationCode: 'JFK',
                destinationLocationCode: 'LAX',
                departureAt: '2025-01-01T00:00:00Z',
            };
            const trip: Trip = {
                id: 'uuid-123',
                departureLocationCode: 'JFK',
                destinationLocationCode: 'LAX',
                departureAt: new Date('2025-01-01T00:00:00Z'),
                arrivalAt: new Date('2025-01-01T02:27:51Z'),
                spaceshipId: 'SS-001',
                status: TripStatus.SCHEDULED,
            };
            mockTripService.requestTrip.mockResolvedValue(trip);

            const result = await tripController.requestTrip(input);

            expect(result).toEqual(trip);
            expect(mockTripService.requestTrip).toHaveBeenCalledWith(input);
        });
    });

    describe('cancelTrip', () => {
        it('should cancel a trip successfully', async () => {
            const id = 'uuid-123';
            const trip: Trip = {
                id,
                departureLocationCode: 'JFK',
                destinationLocationCode: 'LAX',
                departureAt: new Date('2025-01-01T00:00:00Z'),
                arrivalAt: new Date('2025-01-01T02:27:51Z'),
                spaceshipId: 'SS-001',
                status: TripStatus.CANCELLED,
            };
            mockTripService.cancelTrip.mockResolvedValue(trip);

            const result = await tripController.cancelTrip(id);

            expect(result).toEqual(trip);
            expect(mockTripService.cancelTrip).toHaveBeenCalledWith(id);
        });

        it('should throw NotFoundException if trip does not exist', async () => {
            mockTripService.cancelTrip.mockRejectedValue(new NotFoundException('Trip not found'));

            await expect(tripController.cancelTrip('uuid-123')).rejects.toThrow(NotFoundException);
        });
    });

    describe('getTripStatus', () => {
        it('should return trip status', async () => {
            const id = 'uuid-123';
            const trip: Trip = {
                id,
                departureLocationCode: 'JFK',
                destinationLocationCode: 'LAX',
                departureAt: new Date('2025-01-01T00:00:00Z'),
                arrivalAt: new Date('2025-01-01T02:27:51Z'),
                spaceshipId: 'SS-001',
                status: TripStatus.SCHEDULED,
            };
            mockTripService.getTripStatus.mockResolvedValue(trip);

            const result = await tripController.getTripStatus(id);

            expect(result).toEqual(trip);
            expect(mockTripService.getTripStatus).toHaveBeenCalledWith(id);
        });

        it('should throw NotFoundException if trip does not exist', async () => {
            mockTripService.getTripStatus.mockRejectedValue(
                new NotFoundException('Trip not found')
            );

            await expect(tripController.getTripStatus('uuid-123')).rejects.toThrow(
                NotFoundException
            );
        });
    });
});
