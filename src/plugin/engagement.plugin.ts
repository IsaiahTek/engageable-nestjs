import { DataSource, In, ObjectLiteral, Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { Like } from '../entities/like.entity';
import { EngagementAction } from '../entities/engagement-action.entity';
import { Review } from '../entities/review.entity';

interface GetEngageablesOptions<T extends ObjectLiteral> {
  rootType: string; // e.g. 'fundraiser', 'post'
  repository: Repository<T>; // external repo (e.g. FundraiserRepository)
  dataSource: DataSource; // plugin's data source instance
  where?: any;
  pagination?: { page?: number; limit?: number };
  transform?: (item: T) => Promise<any> | any;
}

interface StructuredEngagements {
  comments: Comment[];
  likes: Like[];
  actions: EngagementAction[];
  reviews: Review[];
}

/**
 * Fetches all engagements (likes, actions, comments, reviews) for a batch of root entities (by ID)
 * and structures the data efficiently in-memory without recursive database queries.
 */
async function fetchAndStructureEngagements(
  dataSource: DataSource,
  rootType: string,
  rootIds: string[],
): Promise<Map<string, StructuredEngagements>> {
  const commentRepo = dataSource.getRepository(Comment);
  const likeRepo = dataSource.getRepository(Like);
  const actionRepo = dataSource.getRepository(EngagementAction);
  const reviewRepo = dataSource.getRepository(Review);

  const engagementMap = new Map<string, StructuredEngagements>();

  // Initialize map for all root IDs
  rootIds.forEach(id => {
    engagementMap.set(id, { comments: [], likes: [], actions: [], reviews: [] });
  });

  // 1. Fetch Likes for all root entities
  const likes = await likeRepo.find({
    where: { targetType: rootType, targetId: In(rootIds) },
    relations: ['user'],
  });
  likes.forEach(like => engagementMap.get(like.targetId)?.likes.push(like));

  // 2. Fetch Actions for all root entities
  const actions = await actionRepo.find({
    where: { targetType: rootType, targetId: In(rootIds) },
    relations: ['user'],
  });
  actions.forEach(action => engagementMap.get(action.targetId)?.actions.push(action));

  // 3. Fetch Reviews for all root entities
  const reviews = await reviewRepo.find({
    where: { targetType: rootType, targetId: In(rootIds) },
    relations: ['user'],
    order: { createdAt: 'DESC' },
  });
  reviews.forEach(review => engagementMap.get(review.targetId)?.reviews.push(review));

  // 4. Fetch all comments for all root entities in ONE query
  const allComments = await commentRepo.find({
    where: { targetType: rootType, targetId: In(rootIds) },
    relations: ['user', 'likes', 'parent'],
    order: { createdAt: 'ASC' },
  });

  // Build comment trees per root entity in memory
  const commentLookup = new Map<string, Comment>();
  for (const c of allComments) {
    c.replies = [];
    commentLookup.set(c.id, c);
  }

  for (const c of allComments) {
    if (c.parent?.id && commentLookup.has(c.parent.id)) {
      commentLookup.get(c.parent.id)!.replies.push(c);
    } else if (!c.parent) {
      engagementMap.get(c.targetId)?.comments.push(c);
    }
  }

  // Reverse root comments to have newest first
  for (const [, eng] of engagementMap) {
    eng.comments.reverse();
  }

  return engagementMap;
}

// --- PUBLIC API ---

/**
 * Public static API users can call to get paginated engageables with engagements.
 * The engagement data is attached to each item under the '_engagements' property.
 */
export class EngageablePlugin {
  static async getEngageablesWithEngagements<T extends ObjectLiteral>({
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
      return { data: [], total, page, limit, totalPages: 0 };
    }

    const rootIds = items.map((item: any) => item.id);

    // 2️⃣ Fetch and structure all engagement data
    const engagementMap = await fetchAndStructureEngagements(
      dataSource,
      rootType,
      rootIds,
    );

    // 3️⃣ Attach structured engagement data
    const data = items.map((item: any) => {
      const engagements = engagementMap.get(item.id) || { comments: [], likes: [], actions: [], reviews: [] };

      // Attach structured engagements to the item under a known property
      item._engagements = engagements;

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

