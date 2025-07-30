import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSpaceships1730227200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE spaceship (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        location TEXT NOT NULL
      );
    `);
    await queryRunner.query(`
      INSERT INTO spaceship (code, name, location) VALUES
        ('SS-001', 'Galactic Voyager', 'JFK'),
        ('SS-002', 'Star Hopper', 'JFK'),
        ('SS-003', 'Cosmic Cruiser', 'SFO');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE spaceship;`);
  }
}