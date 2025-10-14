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
exports.EngagementAction = void 0;
const typeorm_1 = require("typeorm");
const engagement_target_entity_1 = require("./engagement-target.entity");
const base_entity_1 = require("./base/base.entity");
let EngagementAction = class EngagementAction extends base_entity_1.BaseEntity {
};
exports.EngagementAction = EngagementAction;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], EngagementAction.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EngagementAction.prototype, "targetId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EngagementAction.prototype, "targetType", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => engagement_target_entity_1.EngagementTarget, { onDelete: 'CASCADE' }),
    __metadata("design:type", engagement_target_entity_1.EngagementTarget)
], EngagementAction.prototype, "engagement", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['repost', 'bookmark', 'share', 'follow'],
    }),
    __metadata("design:type", String)
], EngagementAction.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], EngagementAction.prototype, "metadata", void 0);
exports.EngagementAction = EngagementAction = __decorate([
    (0, typeorm_1.Entity)('engagement_actions'),
    (0, typeorm_1.Unique)(['userId', 'targetId', 'targetType', 'type'])
], EngagementAction);
