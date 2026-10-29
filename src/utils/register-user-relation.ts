import { getMetadataArgsStorage } from 'typeorm';
import { Like } from '../entities/like.entity';
import { Comment } from '../entities/comment.entity';
import { EngagementAction } from '../entities/engagement-action.entity';
import { Review } from '../entities/review.entity';

export function registerUserRelation(userEntity: any) {
  if (!userEntity) return;

  const storage = getMetadataArgsStorage();
  const entities = [Like, EngagementAction, Comment, Review];

  for (const entity of entities) {
    if (!storage.relations.some((r) => r.target === entity && r.propertyName === 'user')) {
      storage.relations.push({
        target: entity,
        propertyName: 'user',
        relationType: 'many-to-one',
        type: () => userEntity,
        options: { onDelete: 'CASCADE', nullable: true, eager: true },
        isLazy: false,
      });
    }

    if (!storage.joinColumns.some((jc) => jc.target === entity && jc.propertyName === 'user')) {
      storage.joinColumns.push({
        target: entity,
        propertyName: 'user',
        name: 'user_id',
      });
    }
  }
}
