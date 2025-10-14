"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngageablePlugin = void 0;
exports.getEngagedEntities = getEngagedEntities;
const typeorm_1 = require("typeorm");
const engagement_target_entity_1 = require("../entities/engagement-target.entity");
const nest_engagements_util_1 = require("../utils/nest-engagements.util");
/**
 * Public static API users can call to get paginated engageables with engagements.
 */
class EngageablePlugin {
    static async getEngageablesWithEngagements({ rootType, repository, dataSource, where = {}, pagination = { page: 1, limit: 10 }, transform, }) {
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
        // 3️⃣ Attach nested engagement data
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
/**
 * Recursively builds nested engagement relationships (comments, replies, likes, etc.)
 */
async function buildNestedEngagements(dataSource, targets) {
    const targetRepo = dataSource.getRepository(engagement_target_entity_1.EngagementTarget);
    // Find all comment targets belonging to these targets
    const commentIds = targets.flatMap((t) => { var _a; return ((_a = t.comments) === null || _a === void 0 ? void 0 : _a.map((c) => c.id)) || []; });
    if (!commentIds.length)
        return targets;
    // Get all EngagementTargets that reference comments (nested engageables)
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
    // Recursively attach them to the parent comments
    for (const target of targets) {
        for (const comment of target.comments || []) {
            const nestedTarget = commentTargets.find((ct) => ct.targetId === comment.id);
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
async function getEngagedEntities(dataSource, entityRepo, targetType, options) {
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
    // Step 3: Build nested comment->reply->like chains
    await buildNestedEngagements(dataSource, rootTargets);
    // Step 4: Merge into the main entities
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
