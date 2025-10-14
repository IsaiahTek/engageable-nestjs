"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUserRelation = registerUserRelation;
const typeorm_1 = require("typeorm");
const like_entity_1 = require("../entities/like.entity");
const comment_entity_1 = require("../entities/comment.entity");
const engagement_action_entity_1 = require("../entities/engagement-action.entity");
function registerUserRelation(userEntity) {
    if (!userEntity)
        return;
    const storage = (0, typeorm_1.getMetadataArgsStorage)();
    storage.relations.push({
        target: like_entity_1.Like,
        propertyName: 'user',
        relationType: 'many-to-one',
        type: () => userEntity,
        options: { onDelete: 'CASCADE', nullable: true, eager: true },
        isLazy: false,
    });
    storage.relations.push({
        target: engagement_action_entity_1.EngagementAction,
        propertyName: 'user',
        relationType: 'many-to-one',
        type: () => userEntity,
        options: { onDelete: 'CASCADE', nullable: true, eager: true },
        isLazy: false,
    });
    storage.relations.push({
        target: comment_entity_1.Comment,
        propertyName: 'user',
        relationType: 'many-to-one',
        type: () => userEntity,
        options: { onDelete: 'CASCADE', nullable: true, eager: true },
        isLazy: false,
    });
}
//# sourceMappingURL=register-user-relation.js.map