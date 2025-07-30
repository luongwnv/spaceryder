import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Spaceship {
    @Field(() => String)
    @PrimaryGeneratedColumn('uuid')
    id: string | undefined;

    @Field(() => String)
    @Column({ type: 'text' })
    code: string | undefined;

    @Field(() => String)
    @Column({ type: 'text' })
    name: string | undefined;

    @Field(() => String)
    @Column({ type: 'text' })
    location: string | undefined;
}
