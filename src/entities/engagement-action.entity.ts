import { Entity, Column, ManyToOne, Unique } from 'typeorm';
// import { EngagementTarget } from './engagement-target.entity';
import { BaseEntity } from './base/base.entity';

@Entity('engagement_actions')
@Unique(['userId', 'targetId', 'targetType', 'type'])
export class EngagementAction extends BaseEntity {
  @Column({ nullable: true })
  userId?: string;

  @Column()
  targetId: string;

  @Column()
  targetType: string;

  // @ManyToOne(() => EngagementTarget, { onDelete: 'CASCADE' })
  // engagement: EngagementTarget;

  @Column({
    type: 'enum',
    enum: ['repost', 'bookmark', 'share', 'follow'],
  })
  type: 'repost' | 'bookmark' | 'share' | 'follow';

  // optional data (like comment text, repostedAt, sharedPlatform, etc.)
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  user?: any;
}
