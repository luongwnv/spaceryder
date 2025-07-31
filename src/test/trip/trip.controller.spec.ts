import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateTripInput } from '../../app/trip/dto/create-trip.input';
import { TripController } from '../../app/trip/trip.controller';
import { Trip, TripStatus } from '../../app/trip/trip.entity';
import { TripService } from '../../app/trip/trip.service';

describe('TripController', () => {
    let controller: TripController;
    let service: TripService;
    
    // Sample test data
    const testTrip: Trip = {
        id: '68006127-7132-4711-809c-05824146797b',
        departureLocationCode: 'JFK',
        destinationLocationCode: 'LAX',
        departureAt: new Date('2025-01-01T00:00:00Z'),
        arrivalAt: new Date('2025-01-01T02:27:51Z'),
        spaceshipId: 'SS-001',
        status: TripStatus.SCHEDULED,
    };
    
    const testInput: CreateTripInput = {
        departureLocationCode: 'JFK',
        destinationLocationCode: 'LAX',
        departureAt: '2025-01-01T00:00:00Z',
    };

    const mockTripService = {
        requestTrip: jest.fn(),
        cancelTrip: jest.fn(),
        getTripStatus: jest.fn(),
        getAllTrips: jest.fn(),
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TripController],
            providers: [{ provide: TripService, useValue: mockTripService }],
        }).compile();

        controller = module.get<TripController>(TripController);
        service = module.get<TripService>(TripService);
    });

    describe('requestTrip', () => {
        it('should create a trip successfully', async () => {
            // Arrange
            mockTripService.requestTrip.mockResolvedValue(testTrip);
            
            // Act
            const result = await controller.requestTrip(testInput);
            
            // Assert
            expect(result).toEqual(testTrip);
            expect(mockTripService.requestTrip).toHaveBeenCalledWith(testInput);
        });
    });

    describe('cancelTrip', () => {
        it('should cancel a trip successfully', async () => {
            // Arrange
            const cancelledTrip = { ...testTrip, status: TripStatus.CANCELLED };
            mockTripService.cancelTrip.mockResolvedValue(cancelledTrip);
            
            // Act
            const result = await controller.cancelTrip(testTrip.id!);
            
            // Assert
            expect(result).toEqual(cancelledTrip);
            expect(mockTripService.cancelTrip).toHaveBeenCalledWith(testTrip.id);
        });

        it('should throw NotFoundException if trip does not exist', async () => {
            // Arrange
            mockTripService.cancelTrip.mockRejectedValue(new NotFoundException('Trip not found'));
            
            // Act & Assert
            await expect(controller.cancelTrip('non-existent-id')).rejects.toThrow(NotFoundException);
        });
    });

    describe('getTripStatus', () => {
        it('should return trip status', async () => {
            // Arrange
            mockTripService.getTripStatus.mockResolvedValue(testTrip);
            
            // Act
            const result = await controller.getTripStatus(testTrip.id!);
            
            // Assert
            expect(result).toEqual(testTrip);
            expect(mockTripService.getTripStatus).toHaveBeenCalledWith(testTrip.id);
        });

        it('should throw NotFoundException if trip does not exist', async () => {
            // Arrange
            mockTripService.getTripStatus.mockRejectedValue(new NotFoundException('Trip not found'));
            
            // Act & Assert
            await expect(controller.getTripStatus('non-existent-id')).rejects.toThrow(NotFoundException);
        });
    });

    // Additional tests can be added here for getAllTrips and other methods
});
