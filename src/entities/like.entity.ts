// like.entity.ts
import { Column, Entity, ManyToOne } from 'typeorm';
import { EngagementTarget } from './engagement-target.entity';
import { BaseEntity } from './base/base.entity';
import { Comment } from './comment.entity';

@Entity('likes')
export class Like extends BaseEntity {
  // @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
  // user: User;

  @Column({ nullable: true })
  userId: string;

  @Column()
  targetId: string;

  @Column()
  targetType: string;

  @ManyToOne(() => EngagementTarget, (target) => target.likes, {
    onDelete: 'CASCADE',
  })
  engagement: EngagementTarget;

  @ManyToOne(() => Like, (like) => like.engagement, {
    nullable: true,
  })
  parent: Like;

  @ManyToOne(() => Comment, (comment) => comment.likes, { nullable: true })
  comment: Comment;

  user?: any;
}
