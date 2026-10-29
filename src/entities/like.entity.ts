// like.entity.ts
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from './base/base.entity';
import { Comment } from './comment.entity';

@Entity('engageable_likes')
@Unique(['userId', 'targetType', 'targetId'])
export class Like extends BaseEntity {

  @Column({ nullable: true, name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', name: 'target_id' })
  targetId: string;

  @Column({ type: 'varchar', name: 'target_type' })
  targetType: string;

  @ManyToOne(() => Like, (like) => like.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  parent: Like;

  children: Like[];

  @ManyToOne(() => Comment, (comment) => comment.likes, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'comment_id' })
  comment: Comment;

  @Column({ nullable: true, name: 'comment_id' })
  commentId?: string;

  user?: any;
}

