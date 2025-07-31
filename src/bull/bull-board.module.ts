import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'trip-queue',
        }),
    ],
    providers: [
        {
            provide: 'BullBoardAdapter',
            useFactory: (tripQueue) => {
                const serverAdapter = new ExpressAdapter();
                serverAdapter.setBasePath('/admin/queues');
                createBullBoard({
                    queues: [new BullMQAdapter(tripQueue)],
                    serverAdapter,
                });
                return serverAdapter;
            },
            inject: [{ token: 'BullQueue_trip-queue', optional: false }],
        },
    ],
    exports: ['BullBoardAdapter'],
})
export class BullBoardModule {}
