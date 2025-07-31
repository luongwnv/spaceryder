import { Logger } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PaginatedTrips, TripRequestInput, TripResponse } from './interface/trip.interface';
import { TripQueueService } from './queue/trip-queue.service';
import { Trip } from './trip.entity';
import { TripService } from './trip.service';

@Resolver(() => Trip)
export class TripResolver {
  private readonly logger = new Logger(TripResolver.name);

  constructor(
    private readonly tripService: TripService,
    private readonly tripQueueService: TripQueueService,
  ) {
    this.logger.log('TripResolver initialized');
  }

  @Mutation(() => TripResponse)
  async requestTrip(@Args('input') input: TripRequestInput) {
    this.logger.log(`Received GraphQL requestTrip: ${JSON.stringify(input)}`);
    return this.tripQueueService.addRequestTripJob(input);
  }

  @Query(() => Trip)
  async getTripStatus(@Args('tripId') tripId: string) {
    this.logger.log(`Received GraphQL getTripStatus for tripId: ${tripId}`);
    return this.tripService.getTripStatus(tripId);
  }

  @Query(() => PaginatedTrips)
  async getAllTrips(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ) {
    this.logger.log(`Received GraphQL getAllTrips: page=${page}, limit=${limit}`);
    return this.tripService.getAllTrips(page, limit);
  }

  @Mutation(() => TripResponse)
  async cancelTrip(@Args('tripId') tripId: string) {
    this.logger.log(`Received GraphQL cancelTrip for tripId: ${tripId}`);
    return this.tripQueueService.addCancelTripJob(tripId);
  }
}