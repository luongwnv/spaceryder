import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitTrips1730227202000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE trip (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        departure_location_code TEXT NOT NULL,
        destination_location_code TEXT NOT NULL,
        departure_at TIMESTAMP NOT NULL,
        arrival_at TIMESTAMP NOT NULL,
        spaceship_id TEXT NOT NULL,
        status TEXT NOT NULL
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE trip;`);
  }
}