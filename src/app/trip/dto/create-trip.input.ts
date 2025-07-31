import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class CreateTripInput {
    @Field(() => String)
    @ApiProperty({ description: 'Airport code for departure (e.g., JFK)' })
    departureLocationCode: string | undefined;

    @Field(() => String)
    @ApiProperty({ description: 'Airport code for destination (e.g., LAX)' })
    destinationLocationCode: string | undefined;

    @Field(() => String)
    @ApiProperty({ description: 'Departure time in ISO-8601 format' })
    departureAt: string | undefined;
}
