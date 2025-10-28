// like.entity.ts
import { Column, Entity, ManyToOne } from 'typeorm';
// import { EngagementTarget } from './engagement-target.entity';
import { BaseEntity } from './base/base.entity';
import { Comment } from './comment.entity';

@Entity('engageable_likes')
export class Like extends BaseEntity {

  @Column({ nullable: true })
  userId: string;

  @Column({ type: 'varchar', name: 'target_id' })
  targetId: string;

  @Column({ type: 'varchar', name: 'target_type' })
  targetType: string;

  // @ManyToOne(() => EngagementTarget, (target) => target.likes, {
  //   onDelete: 'CASCADE',
  // })
  // engagement: EngagementTarget;

  // @ManyToOne(() => Like, (like) => like.engagement, {
  //   nullable: true,
  // })
  // parent: Like;


  @ManyToOne(() => Like, (like) => like.children, { // Corrected inverse property name
    nullable: true,
    onDelete: 'CASCADE', // Added CASCADE for recursive deletion safety
  })
  parent: Like;
  
  // Define the inverse side for the parent/child relationship
  children: Like[]; // This is not a column, but the inverse side of the relationship

  @ManyToOne(() => Comment, (comment) => comment.likes, { nullable: true })
  comment: Comment;

  user?: any;
}
