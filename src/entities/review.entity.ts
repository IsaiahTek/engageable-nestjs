import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base/base.entity";

@Entity('engageable_reviews')
export class Review extends BaseEntity {

    @Column({ nullable: true })
    userId: string;

    @Column()
    text: string;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        transformer: {
            to: (value?: number | null) => value,
            from: (value?: string | null) => (value !== null && value !== undefined ? parseFloat(value) : null),
        },
    })
    rating: number;

    @Column({ type: 'varchar', name: 'target_id' })
    targetId: string;

    @Column({ type: 'varchar', name: 'target_type' })
    targetType: string;

    user?: any;
}