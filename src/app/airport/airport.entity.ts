import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Airport {
    @Field(() => ID)
    @PrimaryGeneratedColumn('uuid')
    id: string | undefined;

    @Field(() => String)
    @Column('text', { unique: true })
    location: string | undefined;

    @Field(() => Number)
    @Column('double precision')
    latitude: number | undefined;

    @Field(() => Number)
    @Column('double precision')
    longitude: number | undefined;
}
