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
exports.Like = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("./base/base.entity");
const comment_entity_1 = require("./comment.entity");
let Like = class Like extends base_entity_1.BaseEntity {
};
exports.Like = Like;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Like.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', name: 'target_id' }),
    __metadata("design:type", String)
], Like.prototype, "targetId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', name: 'target_type' }),
    __metadata("design:type", String)
], Like.prototype, "targetType", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Like, (like) => like.children, {
        nullable: true,
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Like)
], Like.prototype, "parent", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => comment_entity_1.Comment, (comment) => comment.likes, { nullable: true }),
    __metadata("design:type", comment_entity_1.Comment)
], Like.prototype, "comment", void 0);
exports.Like = Like = __decorate([
    (0, typeorm_1.Entity)('engageable_likes')
], Like);
//# sourceMappingURL=like.entity.js.map