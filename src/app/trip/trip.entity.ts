import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Trip {
    @Field(() => String)
    @PrimaryGeneratedColumn('uuid')
    id: string | undefined;

    @Field(() => String)
    @Column({ type: 'text', name: 'departure_location_code' })
    departureLocationCode: string | undefined;

    @Field(() => String)
    @Column({ type: 'text', name: 'destination_location_code' })
    destinationLocationCode: string | undefined;

    @Field(() => Date)
    @Column({ type: 'timestamp', name: 'departure_at' })
    departureAt: Date | undefined;

    @Field(() => Date)
    @Column({ type: 'timestamp', name: 'arrival_at' })
    arrivalAt: Date | undefined;

    @Field(() => String)
    @Column({ type: 'text', name: 'spaceship_id' })
    spaceshipId: string | undefined;

    @Field(() => String)
    @Column({ type: 'text' })
    status: string | undefined; // e.g., SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
}
