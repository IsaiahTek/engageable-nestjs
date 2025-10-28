// // engagement-target.entity.ts
// import { Entity, Column, OneToMany, Unique } from 'typeorm';
// import { Like } from './like.entity';
// import { Comment } from './comment.entity';
// import { BaseEntity } from './base/base.entity';
// import { EngagementAction } from './engagement-action.entity';
// import { Review } from './review.entity';

// @Entity('engagement_targets')
// @Unique(['targetType', 'targetId'])
// export class EngagementTarget extends BaseEntity {
//   @Column()
//   targetType: string; // e.g. 'fundraiser', 'wishlist'

//   @Column()
//   targetId: string; // the ID of the entity (e.g. fundraiser.id)

//   @OneToMany(() => Like, (like) => like.engagement, { cascade: true })
//   likes: Like[];

//   @OneToMany(() => Comment, (comment) => comment.engagement, { cascade: true })
//   comments: Comment[];

//   @OneToMany(() => EngagementAction, (action) => action.engagement, {
//     cascade: true,
//   })
//   actions: EngagementAction[];

//   @OneToMany(() => Review, (review) => review.engagement, { cascade: true })
//   reviews: Review[];

// }
