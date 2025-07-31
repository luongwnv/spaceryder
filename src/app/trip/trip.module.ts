import { BullModule } from '@nestjs/bullmq';
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AirportModule } from '../airport/airport.module';
import { SpaceshipModule } from '../spaceship/spaceship.module';
import { TripQueueModule } from './queue/trip-queue.module';
import { TripQueueProcessor } from './queue/trip-queue.processor';
import { TripController } from './trip.controller';
import { Trip } from './trip.entity';
import { TripGateway } from './trip.gateway';
import { TripResolver } from './trip.resolver';
import { TripService } from './trip.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Trip]),
        AirportModule,
        SpaceshipModule,
        forwardRef(() => TripQueueModule),
        BullModule.registerQueue({
            name: 'trip-queue',
        }),
    ],
    providers: [TripResolver, TripService, TripGateway, TripQueueProcessor],
    controllers: [TripController],
    exports: [TripService, TripGateway],
})
export class TripModule {}
