import { Field, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TripStatus } from './interface/trip.interface';

@ObjectType()
@Entity()
export class Trip {
    @ApiProperty({ description: 'Unique ID of the trip' })
    @Field(() => String)
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @ApiProperty({ description: 'Airport code for departure (e.g., JFK)' })
    @Field(() => String)
    @Column({ type: 'text', name: 'departure_location_code' })
    departureLocationCode?: string;

    @ApiProperty({ description: 'Airport code for destination (e.g., LAX)' })
    @Field(() => String)
    @Column({ type: 'varchar', length: 3, name: 'destination_location_code' })
    destinationLocationCode?: string;

    @ApiProperty({ description: 'Departure time in ISO-8601 format' })
    @Field(() => Date)
    @Column({ type: 'timestamp', name: 'departure_at' })
    departureAt?: Date;

    @ApiProperty({ description: 'Arrival time in ISO-8601 format' })
    @Field(() => Date)
    @Column({ type: 'timestamp', name: 'arrival_at' })
    arrivalAt?: Date;

    @ApiProperty({ description: 'Spaceship ID (e.g., SS-001)' })
    @Field(() => String)
    @Column({ type: 'text', name: 'spaceship_id' })
    spaceshipId?: string;

    @ApiProperty({
        description: 'Trip status',
        enum: TripStatus,
    })
    @Field(() => TripStatus)
    @Column({ type: 'text', name: 'status', default: TripStatus.SCHEDULED })
    status?: TripStatus;
}

export { TripStatus };
