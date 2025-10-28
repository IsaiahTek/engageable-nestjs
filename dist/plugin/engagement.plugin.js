"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngageablePlugin = void 0;
const typeorm_1 = require("typeorm");
const comment_entity_1 = require("../entities/comment.entity");
const like_entity_1 = require("../entities/like.entity");
const engagement_action_entity_1 = require("../entities/engagement-action.entity");
async function getCommentReplies(commentRepo, commentId) {
    const replies = await commentRepo.find({
        where: { parent: { id: commentId } },
        relations: ['user', 'likes', 'actions'],
        order: { createdAt: 'DESC' },
    });
    for (const reply of replies) {
        reply.replies = await getCommentReplies(commentRepo, reply.id);
    }
    return replies;
}
async function fetchAndStructureEngagements(dataSource, rootType, rootIds) {
    const commentRepo = dataSource.getRepository(comment_entity_1.Comment);
    const likeRepo = dataSource.getRepository(like_entity_1.Like);
    const actionRepo = dataSource.getRepository(engagement_action_entity_1.EngagementAction);
    const engagementMap = new Map();
    rootIds.forEach(id => {
        engagementMap.set(id, { comments: [], likes: [], actions: [] });
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
    const rootComments = await commentRepo.find({
        where: { targetType: rootType, targetId: (0, typeorm_1.In)(rootIds), parent: null },
        relations: ['user', 'likes', 'actions'],
        order: { createdAt: 'DESC' },
    });
    for (const rootComment of rootComments) {
        rootComment.replies = await getCommentReplies(commentRepo, rootComment.id);
        engagementMap.get(rootComment.targetId)?.comments.push(rootComment);
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
            const engagements = engagementMap.get(item.id) || { comments: [], likes: [], actions: [] };
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