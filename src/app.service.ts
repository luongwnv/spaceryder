import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
    readonly dbHost: string;
    readonly dbPort: number;
    readonly dbUsername: string;
    readonly dbPassword: string;
    readonly dbName: string;
    readonly redisHost: string;
    readonly redisPort: number;
    readonly port: number;

    constructor(
        @Inject('AppDataSource') private readonly dataSource: DataSource,
        @InjectQueue('trip-queue') private readonly tripQueue: Queue,
        private readonly configService: ConfigService
    ) {
        this.dbHost = this.configService.get<string>('DB_HOST', '');
        this.dbPort = this.configService.get<number>('DB_PORT', 5432);
        this.dbUsername = this.configService.get<string>('DB_USERNAME', '');
        this.dbPassword = this.configService.get<string>('DB_PASSWORD', '');
        this.dbName = this.configService.get<string>('DB_NAME', '');
        this.redisHost = this.configService.get<string>('REDIS_HOST', '');
        this.redisPort = this.configService.get<number>('REDIS_PORT', 6379);
        this.port = this.configService.get<number>('PORT', 3000);
    }

    getHello(): string {
        return 'Welcome to SpaceRyder API';
    }

    async checkHealth(): Promise<{
        status: string;
        postgres: boolean;
        redis: boolean;
        dbDetails?: any;
    }> {
        let postgresStatus = false;
        let redisStatus = false;
        let dbDetails = {};

        try {
            if (!this.dataSource.isInitialized) {
                console.log('Database connection not initialized, attempting to initialize...');

                console.log(
                    `Connecting to PostgreSQL: ${this.dbUsername}@${this.dbHost}:${this.dbPort}/${this.dbName}`
                );

                try {
                    const tempDataSource = new DataSource({
                        type: 'postgres',
                        host: this.dbHost,
                        port: this.dbPort,
                        username: this.dbUsername,
                        password: this.dbPassword,
                        database: this.dbName,
                        synchronize: false,
                    });

                    await tempDataSource.initialize();
                    console.log('Temporary database connection successful');

                    await tempDataSource.query('SELECT 1');
                    postgresStatus = true;

                    await tempDataSource.destroy();

                    try {
                        await this.dataSource.initialize();
                        console.log('Original database connection initialized successfully');
                    } catch (origError) {
                        console.warn(
                            'Original connection failed, but direct connection worked. Check your DataSource configuration.'
                        );
                    }
                } catch (initError) {
                    console.error(
                        'Failed to initialize database connection:',
                        initError instanceof Error ? initError.message : initError
                    );

                    dbDetails = {
                        initialized: false,
                        host: this.dbHost,
                        port: this.dbPort,
                        database: this.dbName,
                        error: initError instanceof Error ? initError.message : String(initError),
                    };
                    throw initError;
                }
            } else {
                await this.dataSource.query('SELECT 1');
                postgresStatus = true;
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error('PostgreSQL health check failed:', error.message);
            } else {
                console.error('PostgreSQL health check failed:', error);
            }
        }

        try {
            await this.tripQueue.getJobCounts();
            redisStatus = true;
        } catch (error) {
            if (error instanceof Error) {
                console.error('Redis health check failed:', error.message);
            } else {
                console.error('Redis health check failed:', error);
            }
        }

        const overallStatus = postgresStatus && redisStatus ? 'healthy' : 'unhealthy';

        return {
            status: overallStatus,
            postgres: postgresStatus,
            redis: redisStatus,
            ...(Object.keys(dbDetails).length > 0 ? { dbDetails } : {}),
        };
    }
}
