import { getMetadataArgsStorage } from 'typeorm';
import { Like } from '../entities/like.entity';
import { Comment } from '../entities/comment.entity';
import { EngagementAction } from '../entities/engagement-action.entity';
import { Review } from '../entities/review.entity';

export function registerUserRelation(userEntity: any) {
  if (!userEntity) return;

  const storage = getMetadataArgsStorage();

  storage.relations.push({
    target: Like,
    propertyName: 'user',
    relationType: 'many-to-one',
    type: () => userEntity,
    options: { onDelete: 'CASCADE', nullable: true, eager: true },
    isLazy: false,
  });

  storage.relations.push({
    target: EngagementAction,
    propertyName: 'user',
    relationType: 'many-to-one',
    type: () => userEntity,
    options: { onDelete: 'CASCADE', nullable: true, eager: true },
    isLazy: false,
  });

  storage.relations.push({
    target: Comment,
    propertyName: 'user',
    relationType: 'many-to-one',
    type: () => userEntity,
    options: { onDelete: 'CASCADE', nullable: true, eager: true },
    isLazy: false,
  });

  storage.relations.push({
    target: Review,
    propertyName: 'user',
    relationType: 'many-to-one',
    type: () => userEntity,
    options: { onDelete: 'CASCADE', nullable: true, eager: true },
    isLazy: false,
  });
}
