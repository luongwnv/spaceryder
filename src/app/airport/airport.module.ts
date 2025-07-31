import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Airport } from './airport.entity';
import { AirportResolver } from './airport.resolver';
import { AirportService } from './airport.service';

@Module({
    imports: [TypeOrmModule.forFeature([Airport])],
    providers: [AirportResolver, AirportService],
    exports: [AirportService],
})
export class AirportModule {}
