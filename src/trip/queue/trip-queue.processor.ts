import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { TripRequestInput } from '../../common/interfaces/trip.interface';
import { TripService } from '../trip.service';

@Processor('trip-queue', {
    concurrency: 10,
})
export class TripQueueProcessor extends WorkerHost {
    private readonly logger = new Logger(TripQueueProcessor.name);

    constructor(@Inject(TripService) private readonly tripService: TripService) {
        super();
        this.logger.log('TripQueueProcessor initialized');
    }

    async process(job: Job<any>): Promise<any> {
        this.logger.log(
            `Processing job ${job.id} of type ${job.name} with data: ${JSON.stringify(job.data)}`
        );

        try {
            await job.updateProgress(10);

            if (job.name === 'request-trip') {
                const data: TripRequestInput = job.data;
                this.logger.log(`Handling request-trip job: ${JSON.stringify(data)}`);

                await job.updateProgress(50);
                const trip = await this.tripService.createTrip(data);

                await job.updateProgress(100);
                this.logger.log(
                    `Trip created successfully for job ${job.id}: ${JSON.stringify(trip)}`
                );
                return trip;
            } else if (job.name === 'cancel-trip') {
                const { tripId } = job.data;
                this.logger.log(`Handling cancel-trip job for tripId: ${tripId}`);

                await job.updateProgress(50);
                await this.tripService.cancelTrip(tripId);

                await job.updateProgress(100);
                this.logger.log(`Trip cancelled successfully for job ${job.id}`);
                return { success: true, tripId };
            } else {
                this.logger.warn(`Unknown job type: ${job.name}`);
                throw new Error(`Unknown job type: ${job.name}`);
            }
        } catch (error: any) {
            this.logger.error(`Failed to process job ${job.id}: ${error.message}`, error.stack);
            throw error;
        }
    }
}
