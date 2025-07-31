import { InjectQueue } from '@nestjs/bullmq';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { validate } from 'class-validator';
import { TripRequestInput } from '../../../common/interfaces/trip.interface';

@Injectable()
export class TripQueueService {
    private readonly logger = new Logger(TripQueueService.name);

    constructor(@InjectQueue('trip-queue') private readonly tripQueue: Queue) {}

    async addRequestTripJob(data: TripRequestInput): Promise<string> {
        const input = new TripRequestInput();
        Object.assign(input, data);
        const errors = await validate(input);
        if (errors.length > 0) {
            this.logger.error(`Validation failed for trip request: ${JSON.stringify(errors)}`);
            throw new BadRequestException('Invalid trip request input');
        }

        try {
            this.logger.log(`Adding trip request job: ${JSON.stringify(data)}`);
            const job = await this.tripQueue.add('request-trip', data, {
                jobId: `request-trip-${data.departureLocationCode}-${data.destinationLocationCode}-${data.departureAt}`,
                attempts: 3,
                backoff: { type: 'exponential', delay: 500 },
            });
            this.logger.log(`Job added successfully: ${job.id}`);
            return (
                job.id ??
                `request-trip-${data.departureLocationCode}-${data.destinationLocationCode}-${data.departureAt}`
            );
        } catch (error) {
            this.logger.error(
                `Failed to add trip request job: ${
                    error instanceof Error ? error.message : String(error)
                }`
            );
            throw error;
        }
    }

    async addCancelTripJob(tripId: string): Promise<string> {
        try {
            this.logger.log(`Adding cancel trip job for tripId: ${tripId}`);
            const job = await this.tripQueue.add(
                'cancel-trip',
                { tripId },
                {
                    jobId: `cancel-trip-${tripId}`,
                    attempts: 3,
                    backoff: { type: 'exponential', delay: 500 },
                }
            );
            this.logger.log(`Cancel job added successfully: ${job.id}`);
            return job.id ?? `cancel-trip-${tripId}`;
        } catch (error) {
            this.logger.error(
                `Failed to add cancel trip job: ${
                    error instanceof Error ? error.message : String(error)
                }`
            );
            throw error;
        }
    }
}
