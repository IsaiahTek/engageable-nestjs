import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "./base/base.entity";
import { EngagementTarget } from "./engagement-target.entity";

@Entity('engageable_reviews')
export class Review extends BaseEntity {

    @Column()
    text: string;

    @Column()
    rating: number;

    @Column()
    targetId: string;

    @Column()
    targetType: string;

    @ManyToOne(() => EngagementTarget, (target) => target.likes, {
        onDelete: 'CASCADE',
    })
    engagement: EngagementTarget;

    user?: any;
}