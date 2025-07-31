import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Spaceship } from './spaceship.entity';
import { SpaceshipResolver } from './spaceship.resolver';
import { SpaceshipService } from './spaceship.service';

@Module({
    imports: [TypeOrmModule.forFeature([Spaceship])],
    providers: [SpaceshipResolver, SpaceshipService],
    exports: [SpaceshipService],
})
export class SpaceshipModule {}
