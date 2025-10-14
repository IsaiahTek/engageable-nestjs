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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngagementController = void 0;
const common_1 = require("@nestjs/common");
const engagement_service_1 = require("../service/engagement.service");
const swagger_1 = require("@nestjs/swagger");
const engagement_registry_1 = require("../registry/engagement.registry");
const comment_dto_1 = require("../dto/comment.dto");
const comment_service_1 = require("../service/comment.service");
const engagement_action_service_1 = require("../service/engagement-action.service");
const user_entity_type_1 = require("../interfaces/user_entity.type");
const like_service_1 = require("../service/like.service");
const constants_1 = require("../utils/constants");
const auth_decorator_1 = require("../decorators/auth.decorator");
let EngagementController = class EngagementController {
    constructor(service, actionService, commentService, likeService, AuthGuard) {
        this.service = service;
        this.actionService = actionService;
        this.commentService = commentService;
        this.likeService = likeService;
        this.AuthGuard = AuthGuard;
    }
    checkIsRegisteredRoute(targetType) {
        if (!engagement_registry_1.EngagementRegistry.isRegisteredByTypeName(targetType)) {
            throw new common_1.NotFoundException(`Engageable type '${targetType}' is not registered. Allowed types: [${engagement_registry_1.EngagementRegistry.list().join(', ')}]`);
        }
    }
    async getTarget(targetType, targetId) {
        this.checkIsRegisteredRoute(targetType);
        return this.service.getTarget(targetType, targetId);
    }
    async getTargets() {
        return this.service.getTargets();
    }
    async getAllComments() {
        return this.commentService.getAllComments();
    }
    async getAllLikes(action) {
        console.log(action);
        return this.actionService.getAllActions(action);
    }
    async deleteTarget(targetType, targetId) {
        this.checkIsRegisteredRoute(targetType);
        return this.service.deleteTarget(targetType, targetId);
    }
    async deleteTargets() {
        return this.service.deleteTargets();
    }
    async countLikes(targetType, targetId) {
        this.checkIsRegisteredRoute(targetType);
        return {
            count: await this.likeService.countLikes(targetType, targetId),
        };
    }
    async addLike(targetType, targetId, req) {
        this.checkIsRegisteredRoute(targetType);
        const userId = req.user?.id;
        console.log('addLike: ', req.user, userId, targetType, targetId);
        return this.likeService.toggleLike(userId, targetType, targetId);
    }
    async addComment(targetType, targetId, commentDto, req) {
        this.checkIsRegisteredRoute(targetType);
        return this.commentService.addComment(req.user, targetType, targetId, commentDto.comment);
    }
    async getComments(targetType, targetId) {
        this.checkIsRegisteredRoute(targetType);
        return this.commentService.getComments(targetType, targetId);
    }
    async deleteLike(targetType, targetId, commentId) {
        this.checkIsRegisteredRoute(targetType);
        return this.commentService.removeComment(commentId);
    }
    async updateComment(targetType, targetId, commentId, commentDto) {
        this.checkIsRegisteredRoute(targetType);
        return this.commentService.updateComment(commentId, commentDto.comment);
    }
    async countActions(targetType, targetId, action) {
        console.log(action);
        this.checkIsRegisteredRoute(targetType);
        return {
            count: await this.actionService.countActions(targetType, targetId, action),
        };
    }
    async toggleLike(targetType, targetId, action, req) {
        this.checkIsRegisteredRoute(targetType);
        return this.actionService.toggleAction(req.user, targetType, targetId, action);
    }
};
exports.EngagementController = EngagementController;
__decorate([
    (0, common_1.Get)(':targetType/:targetId'),
    __param(0, (0, common_1.Param)('targetType')),
    __param(1, (0, common_1.Param)('targetId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EngagementController.prototype, "getTarget", null);
__decorate([
    (0, common_1.Get)('/targets'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EngagementController.prototype, "getTargets", null);
__decorate([
    (0, common_1.Get)('/comments'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EngagementController.prototype, "getAllComments", null);
__decorate([
    (0, common_1.Get)('/:action'),
    (0, swagger_1.ApiProperty)({ enum: user_entity_type_1.EngagementActionType }),
    __param(0, (0, common_1.Param)('action')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EngagementController.prototype, "getAllLikes", null);
__decorate([
    (0, common_1.Delete)(':targetType/:targetId'),
    __param(0, (0, common_1.Param)('targetType')),
    __param(1, (0, common_1.Param)('targetId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EngagementController.prototype, "deleteTarget", null);
__decorate([
    (0, common_1.Delete)('/targets'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EngagementController.prototype, "deleteTargets", null);
__decorate([
    (0, common_1.Get)(':targetType/:targetId/likes'),
    __param(0, (0, common_1.Param)('targetType')),
    __param(1, (0, common_1.Param)('targetId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EngagementController.prototype, "countLikes", null);
__decorate([
    (0, auth_decorator_1.UseEngagementAuth)(),
    (0, common_1.Post)(':targetType/:targetId/like'),
    __param(0, (0, common_1.Param)('targetType')),
    __param(1, (0, common_1.Param)('targetId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], EngagementController.prototype, "addLike", null);
__decorate([
    (0, auth_decorator_1.UseEngagementAuth)(),
    (0, common_1.Post)(':targetType/:targetId/comment'),
    __param(0, (0, common_1.Param)('targetType')),
    __param(1, (0, common_1.Param)('targetId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, comment_dto_1.CommentDto, Object]),
    __metadata("design:returntype", Promise)
], EngagementController.prototype, "addComment", null);
__decorate([
    (0, common_1.Get)(':targetType/:targetId/comments'),
    __param(0, (0, common_1.Param)('targetType')),
    __param(1, (0, common_1.Param)('targetId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EngagementController.prototype, "getComments", null);
__decorate([
    (0, auth_decorator_1.UseEngagementAuth)(),
    (0, common_1.Delete)(':targetType/:targetId/comment/:commentId'),
    __param(0, (0, common_1.Param)('targetType')),
    __param(1, (0, common_1.Param)('targetId')),
    __param(2, (0, common_1.Param)('commentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], EngagementController.prototype, "deleteLike", null);
__decorate([
    (0, auth_decorator_1.UseEngagementAuth)(),
    (0, common_1.Put)(':targetType/:targetId/comment/:commentId'),
    __param(0, (0, common_1.Param)('targetType')),
    __param(1, (0, common_1.Param)('targetId')),
    __param(2, (0, common_1.Param)('commentId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, comment_dto_1.CommentDto]),
    __metadata("design:returntype", Promise)
], EngagementController.prototype, "updateComment", null);
__decorate([
    (0, common_1.Get)(':targetType/:targetId/action/:action' + 's'),
    __param(0, (0, common_1.Param)('targetType')),
    __param(1, (0, common_1.Param)('targetId')),
    __param(2, (0, common_1.Param)('action')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], EngagementController.prototype, "countActions", null);
__decorate([
    (0, auth_decorator_1.UseEngagementAuth)(),
    (0, common_1.Post)(':targetType/:targetId/action/:action'),
    __param(0, (0, common_1.Param)('targetType')),
    __param(1, (0, common_1.Param)('targetId')),
    __param(2, (0, common_1.Param)('action')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], EngagementController.prototype, "toggleLike", null);
exports.EngagementController = EngagementController = __decorate([
    (0, swagger_1.ApiTags)('Engagement'),
    (0, common_1.Controller)({ path: 'engagement', version: '1' }),
    __param(4, (0, common_1.Inject)(constants_1.AUTH_GUARD_KEY)),
    __metadata("design:paramtypes", [engagement_service_1.EngagementService,
        engagement_action_service_1.EngagementActionService,
        comment_service_1.CommentService,
        like_service_1.LikeService, Object])
], EngagementController);
//# sourceMappingURL=engagement.controller.js.map