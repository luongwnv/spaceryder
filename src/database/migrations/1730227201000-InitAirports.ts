import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitAirports1730227201000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE airport (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        location TEXT UNIQUE NOT NULL,
        latitude DOUBLE PRECISION NOT NULL,
        longitude DOUBLE PRECISION NOT NULL
      );
    `);
    await queryRunner.query(`
      INSERT INTO airport (location, latitude, longitude) VALUES
        ('JFK', 40.6413, -73.7781),
        ('SFO', 37.6213, -122.3790),
        ('LAX', 33.9416, -118.4085);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE airport;`);
  }
}