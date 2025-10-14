"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngagementTarget = void 0;
// engagement-target.entity.ts
const typeorm_1 = require("typeorm");
const like_entity_1 = require("./like.entity");
const comment_entity_1 = require("./comment.entity");
const base_entity_1 = require("./base/base.entity");
const engagement_action_entity_1 = require("./engagement-action.entity");
let EngagementTarget = class EngagementTarget extends base_entity_1.BaseEntity {
};
exports.EngagementTarget = EngagementTarget;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EngagementTarget.prototype, "targetType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EngagementTarget.prototype, "targetId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => like_entity_1.Like, (like) => like.engagement, { cascade: true }),
    __metadata("design:type", Array)
], EngagementTarget.prototype, "likes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => comment_entity_1.Comment, (comment) => comment.engagement, { cascade: true }),
    __metadata("design:type", Array)
], EngagementTarget.prototype, "comments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => engagement_action_entity_1.EngagementAction, (action) => action.engagement, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], EngagementTarget.prototype, "actions", void 0);
exports.EngagementTarget = EngagementTarget = __decorate([
    (0, typeorm_1.Entity)('engagement_targets'),
    (0, typeorm_1.Unique)(['targetType', 'targetId'])
], EngagementTarget);
