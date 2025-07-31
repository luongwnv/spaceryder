import { Args, Query, Resolver } from '@nestjs/graphql';
import { Airport } from './airport.entity';
import { AirportService } from './airport.service';

@Resolver(() => Airport)
export class AirportResolver {
    constructor(private airportService: AirportService) {}

    @Query(() => [Airport], { nullable: true })
    async airport(@Args('location') location: string): Promise<Airport[]> {
        const result = await this.airportService.findByLocation(location);
        return Array.isArray(result) ? result : result ? [result] : [];
    }
}
