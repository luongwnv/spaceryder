import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpCode,
    Logger,
    Param,
    Post,
    Query
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateTripInput } from './dto/create-trip.input';
import { Trip } from './trip.entity';
import { TripService } from './trip.service';

@ApiTags('Trips')
@Controller('trips')
export class TripController {
    private readonly logger = new Logger(TripController.name);
    
    constructor(private readonly tripService: TripService) {}

    @Get()
    async getAllTrips(@Query('page') page: string = '1', @Query('limit') limit: string = '10') {
        this.logger.log(`Received get all trips request: page=${page}, limit=${limit}`);
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;

        if (pageNum < 1 || limitNum < 1) {
            this.logger.error(`Invalid pagination params: page=${pageNum}, limit=${limitNum}`);
            throw new BadRequestException('Page and limit must be positive integers');
        }

        return this.tripService.getAllTrips(pageNum, limitNum);
    }

    @Post()
    @ApiOperation({ summary: 'Request a new trip' })
    @ApiBody({ type: CreateTripInput })
    @ApiResponse({ status: 201, description: 'Job ID of the queued trip request', type: String })
    @ApiResponse({ status: 404, description: 'Invalid airport or no spaceship available' })
    async requestTrip(@Body() input: CreateTripInput): Promise<string> {
        return this.tripService.requestTripAsync(input);
    }

    @Post(':tripId')
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
    @ApiResponse({ status: 200, description: 'Trip status details', type: Trip })
    @ApiResponse({ status: 404, description: 'Trip not found' })
    async getTripStatus(@Param('tripId') tripId: string): Promise<Trip> {
        return this.tripService.getTripStatus(tripId);
    }
}
