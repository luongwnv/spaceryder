import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CancelTripInput {
    @Field(() => String)
    tripId: string | undefined;
}
