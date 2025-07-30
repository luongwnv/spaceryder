import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Spaceship } from './spaceship.entity';

@Injectable()
export class SpaceshipService {
    constructor(
        @InjectRepository(Spaceship)
        private spaceshipRepository: Repository<Spaceship>
    ) {}

    async findAvailable(location: string, departureTime: Date): Promise<Spaceship[]> {
        return this.spaceshipRepository.find({ where: { location } });
    }

    async updateLocation(spaceshipId: string | undefined, newLocation: string): Promise<void> {
        await this.spaceshipRepository.update({ id: spaceshipId }, { location: newLocation });
    }
}
