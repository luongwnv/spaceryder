import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { envConfig } from '../config/env.config';
import { AirportModule } from './airport/airport.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { BullBoardModule } from './bull-board.module';
import { SpaceshipModule } from './spaceship/spaceship.module';
import { TripQueueModule } from './trip/queue/trip-queue.module';
import { TripModule } from './trip/trip.module';

@Module({
    imports: [
        ConfigModule.forRoot(envConfig),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('DB_HOST'),
                port: configService.get<number>('DB_PORT'),
                username: configService.get<string>('DB_USERNAME'),
                password: configService.get<string>('DB_PASSWORD'),
                database: configService.get<string>('DB_NAME'),
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
                synchronize: false,
            }),
            dataSourceFactory: async (options: DataSourceOptions | undefined) => {
                if (!options) {
                    throw new Error('DataSourceOptions is undefined');
                }
                const dataSource = await new DataSource(options).initialize();
                return dataSource;
            },
        }),
        BullModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                const connection = {
                    host: configService.get<string>('REDIS_HOST', 'localhost'),
                    port: configService.get<number>('REDIS_PORT', 6379),
                };
                return { connection };
            },
        }),
        BullModule.registerQueue({
            name: 'trip-queue',
            defaultJobOptions: {
                attempts: 3,
                backoff: { type: 'exponential', delay: 1000 },
            },
        }),
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
            playground: true,
            subscriptions: {
                'graphql-ws': true,
            },
        }),
        TripModule,
        AirportModule,
        SpaceshipModule,
        TripQueueModule,
        // BullBoardModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: 'AppDataSource',
            useFactory: async (configService: ConfigService) => {
                const dataSource = new DataSource({
                    type: 'postgres',
                    host: configService.get<string>('DB_HOST'),
                    port: configService.get<number>('DB_PORT'),
                    username: configService.get<string>('DB_USERNAME'),
                    password: configService.get<string>('DB_PASSWORD'),
                    database: configService.get<string>('DB_NAME'),
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                });
                return dataSource.initialize();
            },
            inject: [ConfigService],
        },
        {
            provide: 'TRIP_QUEUE',
            useFactory: (queue: Queue) => queue,
            inject: [{ token: 'BullQueue_trip-queue', optional: false }],
        },
    ],
})
export class AppModule {
    static setupSwagger(app: any) {
        const config = new DocumentBuilder()
            .setTitle('SpaceRyder API')
            .setDescription('API for SpaceRyder intercity space travel booking')
            .setVersion('1.0')
            .build();
        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api/docs', app, document);
    }

    // static setupBullBoard(app: any) {
    //   const serverAdapter = app.get(BullBoardModule).serverAdapter;
    //   app.use('/admin/queues', serverAdapter.getRouter());
    // }
}
