// comment.entity.ts
import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
// import { EngagementTarget } from './engagement-target.entity';
import { BaseEntity } from './base/base.entity';
import { Like } from './like.entity';

@Entity('engageable_comments')
export class Comment extends BaseEntity {
  @Column('text')
  content: string;

  @Column({ nullable: true })
  userId: string;

  @Column()
  targetId: string;

  @Column()
  targetType: string;

  // @ManyToOne(() => EngagementTarget, (target) => target.comments, {
  //   onDelete: 'CASCADE',
  // })
  // engagement: EngagementTarget;

  @ManyToOne(() => Comment, (comment) => comment.replies, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  parent?: Comment;

  @OneToMany(() => Comment, (comment) => comment.parent, {
    cascade: true,
  })
  replies: Comment[];

  @OneToMany(() => Like, (like) => like.comment, { cascade: true })
  likes: Like[];

  user?: any;
}
