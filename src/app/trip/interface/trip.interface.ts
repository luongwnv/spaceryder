import { Field, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';
import { Trip } from '../trip.entity';

export enum TripStatus {
    SCHEDULED = 'SCHEDULED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

registerEnumType(TripStatus, { name: 'TripStatus' });

@InputType()
export class TripRequestInput {
    @ApiProperty({ description: 'Airport code for departure (e.g., JFK)' })
    @Field(() => String)
    @IsString()
    @IsNotEmpty()
    departureLocationCode?: string;

    @ApiProperty({ description: 'Airport code for destination (e.g., LAX)' })
    @Field(() => String)
    @IsString()
    @IsNotEmpty()
    destinationLocationCode?: string;

    @ApiProperty({ description: 'Departure time in ISO-8601 format' })
    @Field(() => String)
    @IsDateString()
    @IsNotEmpty()
    departureAt?: string;
}

@ObjectType()
export class TripResponse {
    @ApiProperty({ description: 'Response message' })
    @Field(() => String)
    message?: string | null;

    @ApiProperty({ description: 'Job ID' })
    @Field(() => String, { nullable: true })
    jobId?: string;

    @ApiProperty({ description: 'HTTP status code' })
    @Field(() => Int)
    statusCode?: number;
}

@ObjectType()
export class PaginatedTrips {
    @ApiProperty({ description: 'List of trips', type: [Trip] })
    @Field(() => [Trip])
    trips?: Trip[];

    @ApiProperty({ description: 'Total number of trips' })
    @Field(() => Int)
    total?: number;

    @ApiProperty({ description: 'Current page' })
    @Field(() => Int)
    page?: number;

    @ApiProperty({ description: 'Items per page' })
    @Field(() => Int)
    limit?: number;
}
