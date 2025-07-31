import { Args, Query, Resolver } from '@nestjs/graphql';
import { Spaceship } from './spaceship.entity';
import { SpaceshipService } from './spaceship.service';

@Resolver(() => Spaceship)
export class SpaceshipResolver {
    constructor(private spaceshipService: SpaceshipService) {}

    @Query(() => [Spaceship])
    async spaceships(
        @Args('location', { nullable: true }) location?: string
    ): Promise<Spaceship[]> {
        return this.spaceshipService.findAvailable(location ?? '', new Date());
    }
}
