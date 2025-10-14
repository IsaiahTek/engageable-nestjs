"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngageablePlugin = void 0;
exports.getEngagedEntities = getEngagedEntities;
const typeorm_1 = require("typeorm");
const engagement_target_entity_1 = require("../entities/engagement-target.entity");
const nest_engagements_util_1 = require("../utils/nest-engagements.util");
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
            return { data: [], total, page, limit };
        }
        const targetRepo = dataSource.getRepository(engagement_target_entity_1.EngagementTarget);
        const allTargets = await targetRepo.find({
            where: {
                targetType: (0, typeorm_1.In)([rootType, 'comment']),
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
        const data = items.map((item) => {
            const target = allTargets.find((t) => t.targetType === rootType && t.targetId === item.id);
            if (target) {
                item.engagementTarget = (0, nest_engagements_util_1.nestEngagements)(target, allTargets);
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
exports.EngageablePlugin = EngageablePlugin;
async function buildNestedEngagements(dataSource, targets) {
    const targetRepo = dataSource.getRepository(engagement_target_entity_1.EngagementTarget);
    const commentIds = targets.flatMap((t) => t.comments?.map((c) => c.id) || []);
    if (!commentIds.length)
        return targets;
    const commentTargets = await targetRepo.find({
        where: { targetType: 'comment', targetId: (0, typeorm_1.In)(commentIds) },
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
    for (const target of targets) {
        for (const comment of target.comments || []) {
            const nestedTarget = commentTargets.find((ct) => ct.targetId === comment.id);
            if (nestedTarget) {
                comment.likes = nestedTarget.likes || [];
                comment.replies = nestedTarget.comments || [];
            }
        }
    }
    if (commentTargets.length) {
        await buildNestedEngagements(dataSource, commentTargets);
    }
    return targets;
}
async function getEngagedEntities(dataSource, entityRepo, targetType, options) {
    const { where = {}, order = {}, page = 1, limit = 10 } = options || {};
    const skip = (page - 1) * limit;
    const [entities, total] = await entityRepo.findAndCount({
        where,
        order,
        skip,
        take: limit,
    });
    if (!entities.length) {
        return { data: [], total, page, limit, totalPages: 0 };
    }
    const targetRepo = dataSource.getRepository(engagement_target_entity_1.EngagementTarget);
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
    await buildNestedEngagements(dataSource, rootTargets);
    const merged = entities.map((entity) => {
        entity.engagement = rootTargets.find((t) => t.targetId === entity.id) || null;
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
//# sourceMappingURL=engagement.plugin.js.map