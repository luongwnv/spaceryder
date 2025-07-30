import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

@ObjectType()
export class TripStatus {
    @ApiProperty({ description: 'Unique ID of the trip' })
    @Field(() => String)
    id: string | undefined;

    @ApiProperty({ description: 'Airport code for departure (e.g., JFK)' })
    @Field(() => String)
    departureLocationCode: string | undefined;

    @ApiProperty({ description: 'Airport code for destination (e.g., LAX)' })
    @Field(() => String)
    destinationLocationCode: string | undefined;

    @ApiProperty({ description: 'Departure time in ISO-8601 format' })
    @Field(() => String)
    departureAt: string | Date | undefined;

    @ApiProperty({ description: 'Arrival time in ISO-8601 format' })
    @Field(() => String)
    arrivalAt: string | Date | undefined;

    @ApiProperty({ description: 'Spaceship ID (e.g., SS-001)' })
    @Field(() => String)
    spaceshipId: string | undefined;

    @ApiProperty({
        description: 'Trip status',
        enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    })
    @Field(() => String)
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | undefined;
}

@InputType()
export class TripRequestInput {
    @ApiProperty({ description: 'Airport code for departure (e.g., JFK)' })
    @Field(() => String)
    @IsString()
    @IsNotEmpty()
    departureLocationCode: string | undefined;

    @ApiProperty({ description: 'Airport code for destination (e.g., LAX)' })
    @Field(() => String)
    @IsString()
    @IsNotEmpty()
    destinationLocationCode: string | undefined;

    @ApiProperty({ description: 'Departure time in ISO-8601 format' })
    @Field(() => String)
    @IsDateString()
    @IsNotEmpty()
    departureAt: string | Date | undefined;
}
