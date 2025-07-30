import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { TripStatus } from '../common/interfaces/trip.interface';
import { CreateTripInput } from './dto/create-trip.input';
import { TripService } from './trip.service';

@Resolver()
export class TripResolver {
    private readonly pubSub: PubSub;

    constructor(private readonly tripService: TripService) {
        this.pubSub = new PubSub();
    }

    @Mutation(() => String)
    async requestTrip(@Args('input') input: CreateTripInput): Promise<string> {
        return this.tripService.requestTripAsync(input);
    }

    @Mutation(() => String)
    async cancelTrip(@Args('tripId') tripId: string): Promise<string> {
        return this.tripService.cancelTripAsync(tripId);
    }

    @Query(() => TripStatus)
    async tripStatus(@Args('tripId') tripId: string): Promise<TripStatus> {
        return this.tripService.getTripStatus(tripId);
    }

    @Subscription(() => TripStatus)
    tripStatusUpdated() {
        return this.pubSub.asyncIterator('tripStatusUpdated');
    }
}
