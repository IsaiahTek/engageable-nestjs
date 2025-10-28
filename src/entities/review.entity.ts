import { Column, Double, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "./base/base.entity";
// import { EngagementTarget } from "./engagement-target.entity";

@Entity('engageable_reviews')
export class Review extends BaseEntity {

    @Column({ nullable: true })
    userId: string;

    @Column()
    text: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    rating: number;

    @Column({type: 'varchar', name: 'target_id'})
    targetId?: string;

    @Column({type: 'varchar', name: 'target_type'})
    targetType: string;

    // @ManyToOne(() => EngagementTarget, (target) => target.likes, {
    //     onDelete: 'CASCADE',
    // })
    // engagement: EngagementTarget;

    user?: any;
}