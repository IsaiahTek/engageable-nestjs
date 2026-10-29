"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUserRelation = registerUserRelation;
const typeorm_1 = require("typeorm");
const like_entity_1 = require("../entities/like.entity");
const comment_entity_1 = require("../entities/comment.entity");
const engagement_action_entity_1 = require("../entities/engagement-action.entity");
const review_entity_1 = require("../entities/review.entity");
function registerUserRelation(userEntity) {
    if (!userEntity)
        return;
    const storage = (0, typeorm_1.getMetadataArgsStorage)();
    const entities = [like_entity_1.Like, engagement_action_entity_1.EngagementAction, comment_entity_1.Comment, review_entity_1.Review];
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
//# sourceMappingURL=register-user-relation.js.map