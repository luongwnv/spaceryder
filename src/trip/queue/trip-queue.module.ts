import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AirportModule } from '../../airport/airport.module';
import { SpaceshipModule } from '../../spaceship/spaceship.module';
import { Trip } from '../trip.entity';
import { TripModule } from '../trip.module';
import { TripQueueProcessor } from './trip-queue.processor';
import { TripQueueService } from './trip-queue.service';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'trip-queue',
            defaultJobOptions: {
                attempts: 3,
                backoff: { type: 'exponential', delay: 1000 },
            },
        }),
        TypeOrmModule.forFeature([Trip]),
        AirportModule,
        SpaceshipModule,
        TripModule,
    ],
    providers: [TripQueueService, TripQueueProcessor],
    exports: [TripQueueService],
})
export class TripQueueModule {}
