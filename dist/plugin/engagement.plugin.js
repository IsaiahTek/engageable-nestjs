"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngageablePlugin = void 0;
const typeorm_1 = require("typeorm");
const comment_entity_1 = require("../entities/comment.entity");
const like_entity_1 = require("../entities/like.entity");
const engagement_action_entity_1 = require("../entities/engagement-action.entity");
const review_entity_1 = require("../entities/review.entity");
async function fetchAndStructureEngagements(dataSource, rootType, rootIds) {
    const commentRepo = dataSource.getRepository(comment_entity_1.Comment);
    const likeRepo = dataSource.getRepository(like_entity_1.Like);
    const actionRepo = dataSource.getRepository(engagement_action_entity_1.EngagementAction);
    const reviewRepo = dataSource.getRepository(review_entity_1.Review);
    const engagementMap = new Map();
    rootIds.forEach(id => {
        engagementMap.set(id, { comments: [], likes: [], actions: [], reviews: [] });
    });
    const likes = await likeRepo.find({
        where: { targetType: rootType, targetId: (0, typeorm_1.In)(rootIds) },
        relations: ['user'],
    });
    likes.forEach(like => engagementMap.get(like.targetId)?.likes.push(like));
    const actions = await actionRepo.find({
        where: { targetType: rootType, targetId: (0, typeorm_1.In)(rootIds) },
        relations: ['user'],
    });
    actions.forEach(action => engagementMap.get(action.targetId)?.actions.push(action));
    const reviews = await reviewRepo.find({
        where: { targetType: rootType, targetId: (0, typeorm_1.In)(rootIds) },
        relations: ['user'],
        order: { createdAt: 'DESC' },
    });
    reviews.forEach(review => engagementMap.get(review.targetId)?.reviews.push(review));
    const allComments = await commentRepo.find({
        where: { targetType: rootType, targetId: (0, typeorm_1.In)(rootIds) },
        relations: ['user', 'likes', 'parent'],
        order: { createdAt: 'ASC' },
    });
    const commentLookup = new Map();
    for (const c of allComments) {
        c.replies = [];
        commentLookup.set(c.id, c);
    }
    for (const c of allComments) {
        if (c.parent?.id && commentLookup.has(c.parent.id)) {
            commentLookup.get(c.parent.id).replies.push(c);
        }
        else if (!c.parent) {
            engagementMap.get(c.targetId)?.comments.push(c);
        }
    }
    for (const [, eng] of engagementMap) {
        eng.comments.reverse();
    }
    return engagementMap;
}
class EngageablePlugin {
    static async getEngageablesWithEngagements({ rootType, repository, dataSource, where = {}, pagination = { page: 1, limit: 10 }, transform, }) {
        const page = pagination.page || 1;
        const limit = pagination.limit || 10;
        const skip = (page - 1) * limit;
        const [items, total] = await repository.findAndCount({
            where,
            skip,
            take: limit,
        });
        if (items.length === 0) {
            return { data: [], total, page, limit, totalPages: 0 };
        }
        const rootIds = items.map((item) => item.id);
        const engagementMap = await fetchAndStructureEngagements(dataSource, rootType, rootIds);
        const data = items.map((item) => {
            const engagements = engagementMap.get(item.id) || { comments: [], likes: [], actions: [], reviews: [] };
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
exports.EngageablePlugin = EngageablePlugin;
//# sourceMappingURL=engagement.plugin.js.map