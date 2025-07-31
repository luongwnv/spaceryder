import { InjectQueue } from '@nestjs/bullmq';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { validate } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';
import { TripRequestInput } from '../interface/trip.interface';

@Injectable()
export class TripQueueService {
    private readonly logger = new Logger(TripQueueService.name);

    constructor(@InjectQueue('trip-queue') private readonly tripQueue: Queue) {}

    async addRequestTripJob(data: TripRequestInput): Promise<any> {
        const input = new TripRequestInput();
        Object.assign(input, data);
        const errors = await validate(input);
        if (errors.length > 0) {
            this.logger.error(`Validation failed for trip request: ${JSON.stringify(errors)}`);
            throw new BadRequestException('Invalid trip request input');
        }

        try {
            this.logger.log(`Adding trip request job: ${JSON.stringify(data)}`);

            const uniqueId = uuidv4().substring(0, 8);
            const jobId = `request-trip-${data.departureLocationCode}-${data.destinationLocationCode}-${data.departureAt}-${uniqueId}`;

            const job = await this.tripQueue.add('request-trip', data, {
                jobId,
                attempts: 3,
                backoff: { type: 'exponential', delay: 500 },
            });

            this.logger.log(`Job added successfully: ${job.id}`);
            return {
                statusCode: 200,
                message: 'Trip request added successfully',
                data: {
                    jobId: job.id ?? jobId,
                },
            };
        } catch (error) {
            this.logger.error(
                `Failed to add trip request job: ${
                    error instanceof Error ? error.message : String(error)
                }`
            );
            throw error;
        }
    }

    async addCancelTripJob(tripId: string): Promise<any> {
        try {
            this.logger.log(`Adding cancel trip job for tripId: ${tripId}`);

            const uniqueId = uuidv4().substring(0, 8);
            const jobId = `cancel-trip-${tripId}-${uniqueId}`;

            const job = await this.tripQueue.add(
                'cancel-trip',
                { tripId },
                {
                    jobId,
                    attempts: 3,
                    backoff: { type: 'exponential', delay: 500 },
                }
            );

            this.logger.log(`Cancel job added successfully: ${job.id}`);
            return {
                statusCode: 200,
                message: 'Cancel trip request added successfully',
                data: {
                    jobId: job.id,
                },
            };
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
