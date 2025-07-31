import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Airport } from './airport.entity';

@Injectable()
export class AirportService {
    constructor(
        @InjectRepository(Airport)
        private airportRepository: Repository<Airport>
    ) {}

    async findByLocation(location: any): Promise<Airport | null> {
        console.log('Finding airport by location:', location);
        return await this.airportRepository.findOne({
            where: { location: location },
        });
    }
}
