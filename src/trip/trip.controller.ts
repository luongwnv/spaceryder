import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TripStatus } from '../common/interfaces/trip.interface';
import { CreateTripInput } from './dto/create-trip.input';
import { TripService } from './trip.service';

@ApiTags('Trips')
@Controller('trips')
export class TripController {
    constructor(private readonly tripService: TripService) {}

    @Post()
    @ApiOperation({ summary: 'Request a new trip' })
    @ApiBody({ type: CreateTripInput })
    @ApiResponse({ status: 201, description: 'Job ID of the queued trip request', type: String })
    @ApiResponse({ status: 404, description: 'Invalid airport or no spaceship available' })
    async requestTrip(@Body() input: CreateTripInput): Promise<string> {
        return this.tripService.requestTripAsync(input);
    }

    @Delete(':tripId')
    @HttpCode(200)
    @ApiOperation({ summary: 'Cancel a trip' })
    @ApiParam({ name: 'tripId', description: 'Unique ID of the trip' })
    @ApiResponse({ status: 200, description: 'Job ID of the queued cancel request', type: String })
    @ApiResponse({ status: 404, description: 'Trip not found' })
    async cancelTrip(@Param('tripId') tripId: string): Promise<string> {
        return this.tripService.cancelTripAsync(tripId);
    }

    @Get(':tripId')
    @ApiOperation({ summary: 'Get trip status' })
    @ApiParam({ name: 'tripId', description: 'Unique ID of the trip' })
    @ApiResponse({ status: 200, description: 'Trip status details', type: TripStatus })
    @ApiResponse({ status: 404, description: 'Trip not found' })
    async getTripStatus(@Param('tripId') tripId: string): Promise<TripStatus> {
        return this.tripService.getTripStatus(tripId);
    }
}
