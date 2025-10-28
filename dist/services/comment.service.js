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
exports.CommentService = void 0;
const common_1 = require("@nestjs/common");
const comment_entity_1 = require("../entities/comment.entity");
const typeorm_1 = require("typeorm");
const engagement_emitter_1 = require("../event-emitters/engagement.emitter");
const engagement_service_1 = require("./engagement.service");
const typeorm_2 = require("@nestjs/typeorm");
const enums_1 = require("../utils/enums");
const constants_1 = require("../utils/constants");
let CommentService = class CommentService extends engagement_service_1.EngagementService {
    constructor(dataSource, userEntity, options, engagementEmitter, commentRepo) {
        super(dataSource, userEntity, options, engagementEmitter);
        this.dataSource = dataSource;
        this.userEntity = userEntity;
        this.options = options;
        this.engagementEmitter = engagementEmitter;
        this.commentRepo = commentRepo;
    }
    async addComment(userId, targetType, targetId, content, parentId) {
        if (this.hasUserSupport && !this.options.allowAnonymous) {
            if (!userId) {
                throw new common_1.ForbiddenException('Authentication required to comment');
            }
            const userRepo = this.dataSource.getRepository(this.userEntity);
            const user = await userRepo.findOne({ where: { id: userId } });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            return await this._addComment({
                user,
                targetType: targetType,
                targetId: targetId,
                content,
                parentId,
            });
        }
        else {
            return await this._addComment({
                user: null,
                targetType: targetType,
                targetId: targetId,
                content,
                parentId,
            });
        }
    }
    async getComments(targetType, targetId) {
        return this._getComments(targetType, targetId);
    }
    async removeComment(commentId) {
        return await this._removeComment(commentId);
    }
    async updateComment(commentId, content) {
        return await this._updateComment(commentId, content);
    }
    async getCommentReplies(commentId) {
        const replies = await this.commentRepo.find({
            where: { parent: { id: commentId } },
            relations: ['user', 'likes'],
            order: { createdAt: 'DESC' },
        });
        for (const reply of replies) {
            reply.replies = await this.getCommentReplies(reply.id);
        }
        return replies;
    }
    async getAllComments() {
        return this.commentRepo.find({
            relations: ['user', 'likes', 'replies', 'replies.user', 'replies.likes'],
            order: { createdAt: 'DESC' },
        });
    }
    async buildCommentTree(comment) {
        const replies = await this.commentRepo.find({
            where: { parent: { id: comment.id } },
            relations: ['user', 'likes'],
        });
        return {
            ...comment,
            replies: await Promise.all(replies.map((c) => this.buildCommentTree(c))),
        };
    }
    async _addComment({ user, targetType, targetId, content, parentId, }) {
        let parentComment;
        if (parentId) {
            parentComment = await this.commentRepo.findOne({ where: { id: parentId } });
            if (!parentComment)
                throw new common_1.NotFoundException('Parent comment not found');
        }
        const comment = this.commentRepo.create({
            user,
            targetId: targetId,
            targetType: targetType,
            content,
            parent: parentComment,
        });
        this.engagementEmitter.emit(enums_1.EngagementEvent.COMMENT_CREATED, {
            comment,
        });
        return this.commentRepo.save(comment);
    }
    async _getComments(targetType, targetId) {
        const rootComments = await this.commentRepo.find({
            where: {
                targetType,
                targetId,
                parent: null,
            },
            relations: [
                'user',
                'likes',
                'likes.user',
            ],
            order: { createdAt: 'DESC' },
        });
        return Promise.all(rootComments.map(comment => this.buildCommentTree(comment)));
    }
    async _updateComment(commentId, content) {
        const comment = await this.commentRepo.findOne({
            where: { id: commentId },
        });
        if (!comment)
            throw new common_1.NotFoundException('Comment not found');
        comment.content = content;
        return this.commentRepo.save(comment);
    }
    async _removeComment(commentId) {
        const comment = await this.commentRepo.findOne({
            where: { id: commentId },
        });
        if (!comment)
            throw new common_1.NotFoundException('Comment not found');
        const result = this.commentRepo.remove(comment);
        super.engagementEmitter.emit(enums_1.EngagementEvent.COMMENT_DELETED, { result });
        return result;
    }
};
exports.CommentService = CommentService;
exports.CommentService = CommentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectDataSource)()),
    __param(1, (0, common_1.Inject)(constants_1.UserEntityKey)),
    __param(2, (0, common_1.Inject)(constants_1.EngagementOptionsKey)),
    __param(4, (0, typeorm_2.InjectRepository)(comment_entity_1.Comment)),
    __metadata("design:paramtypes", [typeorm_1.DataSource, Object, Object, engagement_emitter_1.EngagementEmitter,
        typeorm_1.Repository])
], CommentService);
//# sourceMappingURL=comment.service.js.map