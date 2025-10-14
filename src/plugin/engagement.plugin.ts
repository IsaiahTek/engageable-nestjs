import { DataSource, In, Repository } from 'typeorm';
import { EngagementTarget } from '../entities/engagement-target.entity';
import { nestEngagements } from '../utils/nest-engagements.util';

interface GetEngageablesOptions<T> {
  rootType: string; // e.g. 'fundraiser', 'post'
  repository: Repository<T>; // external repo (e.g. fundraiserRepository)
  dataSource: DataSource; // plugin's data source instance
  where?: any;
  pagination?: { page?: number; limit?: number };
  transform?: (item: T) => Promise<any> | any;
}

/**
 * Public static API users can call to get paginated engageables with engagements.
 */
export class EngageablePlugin {
  static async getEngageablesWithEngagements<T>({
    rootType,
    repository,
    dataSource,
    where = {},
    pagination = { page: 1, limit: 10 },
    transform,
  }: GetEngageablesOptions<T>) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    // 1️⃣ Fetch the base engageables
    const [items, total] = await repository.findAndCount({
      where,
      skip,
      take: limit,
    });

    if (items.length === 0) {
      return { data: [], total, page, limit };
    }

    // 2️⃣ Get all engagement targets related to these engageables
    const targetRepo = dataSource.getRepository(EngagementTarget);
    const allTargets = await targetRepo.find({
      where: {
        targetType: In([rootType, 'comment']),
      },
      relations: [
        'actions',
        'likes',
        'comments',
        'comments.user',
        'comments.likes',
        'comments.replies',
        'comments.replies.user',
        'comments.replies.likes',
      ],
    });

    // 3️⃣ Attach nested engagement data
    const data = items.map((item: any) => {
      const target = allTargets.find(
        (t) => t.targetType === rootType && t.targetId === item.id,
      );

      if (target) {
        item.engagementTarget = nestEngagements(target, allTargets);
      }

      return transform ? transform(item) : item;
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Recursively builds nested engagement relationships (comments, replies, likes, etc.)
 */
async function buildNestedEngagements(
  dataSource: DataSource,
  targets: EngagementTarget[],
): Promise<EngagementTarget[]> {
  const targetRepo = dataSource.getRepository(EngagementTarget);

  // Find all comment targets belonging to these targets
  const commentIds = targets.flatMap((t) => t.comments?.map((c) => c.id) || []);
  if (!commentIds.length) return targets;

  // Get all EngagementTargets that reference comments (nested engageables)
  const commentTargets = await targetRepo.find({
    where: { targetType: 'comment', targetId: In(commentIds) },
    relations: [
      'actions',
      'likes',
      'comments',
      'comments.user',
      'comments.likes',
      'comments.replies',
      'comments.replies.user',
      'comments.replies.likes',
    ],
  });

  // Recursively attach them to the parent comments
  for (const target of targets) {
    for (const comment of target.comments || []) {
      const nestedTarget = commentTargets.find(
        (ct) => ct.targetId === comment.id,
      );
      if (nestedTarget) {
        // Attach likes from the comment target
        comment.likes = nestedTarget.likes || [];
        // Attach replies as comments from nested target
        comment.replies = nestedTarget.comments || [];
      }
    }
  }

  // Repeat recursion for deeper nesting (if any)
  if (commentTargets.length) {
    await buildNestedEngagements(dataSource, commentTargets);
  }

  return targets;
}

/**
 * Main utility for plugin users to fetch entities with fully nested engagement data.
 */
export async function getEngagedEntities<
  T extends { id: string; engagement: EngagementTarget },
>(
  dataSource: DataSource,
  entityRepo: Repository<T>,
  targetType: string,
  options?: {
    where?: any;
    order?: any;
    page?: number;
    limit?: number;
  },
) {
  const { where = {}, order = {}, page = 1, limit = 10 } = options || {};
  const skip = (page - 1) * limit;

  // Step 1: Fetch entities (external engageables)
  const [entities, total] = await entityRepo.findAndCount({
    where,
    order,
    skip,
    take: limit,
  });

  if (!entities.length) {
    return { data: [], total, page, limit, totalPages: 0 };
  }

  // Step 2: Fetch EngagementTargets for those entities
  const targetRepo = dataSource.getRepository(EngagementTarget);

  const rootTargets = await targetRepo.find({
    where: entities.map((e) => ({
      targetType,
      targetId: e.id,
    })),
    relations: [
      'actions',
      'likes',
      'comments',
      'comments.user',
      'comments.likes',
      'comments.replies',
      'comments.replies.user',
      'comments.replies.likes',
    ],
  });

  // Step 3: Build nested comment->reply->like chains
  await buildNestedEngagements(dataSource, rootTargets);

  // Step 4: Merge into the main entities
  const merged = entities.map((entity) => {
    entity.engagement =
      rootTargets.find((t) => t.targetId === entity.id) || null;
    return entity;
  });

  return {
    data: merged,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
