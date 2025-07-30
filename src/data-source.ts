import { DataSource } from 'typeorm';
import { Airport } from './airport/airport.entity';
import { Spaceship } from './spaceship/spaceship.entity';
import { Trip } from './trip/trip.entity';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'user123',
    password: process.env.DB_PASSWORD || 'password123',
    database: process.env.DB_NAME || 'spacerryder',
    entities: [Spaceship, Airport, Trip],
    migrations: ['src/database/migrations/*.ts'],
});
