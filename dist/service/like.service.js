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
exports.LikeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const like_entity_1 = require("../entities/like.entity");
const enums_1 = require("../utils/enums");
const engagement_service_1 = require("./engagement.service");
const typeorm_2 = require("@nestjs/typeorm");
const engagement_target_entity_1 = require("../entities/engagement-target.entity");
const engagement_emitter_1 = require("../event-emitters/engagement.emitter");
const constants_1 = require("../utils/constants");
let LikeService = class LikeService extends engagement_service_1.EngagementService {
    constructor(dataSource, targetRepo, userEntity, options, engagementEmitter, likeRepo) {
        super(dataSource, targetRepo, userEntity, options, engagementEmitter);
        this.dataSource = dataSource;
        this.targetRepo = targetRepo;
        this.userEntity = userEntity;
        this.options = options;
        this.engagementEmitter = engagementEmitter;
        this.likeRepo = likeRepo;
    }
    async getAllLikes() {
        return this.likeRepo.find({
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
    }
    async toggleLike(userId, targetType, targetId) {
        console.log('toggleLike: ', userId, targetType, targetId);
        const target = await this.ensureTarget(targetType, targetId);
        if (this.hasUserSupport && !this.options.allowAnonymous) {
            if (!userId) {
                throw new common_1.ForbiddenException('Authentication required to like');
            }
            const userRepo = this.dataSource.getRepository(this.userEntity);
            const user = await userRepo.findOne({ where: { id: userId } });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            return await this._toggleLike(user, target.targetType, target.targetId);
        }
        else {
            // Anonymous engagement
            return await this._toggleLike(null, target.targetType, target.targetId);
        }
    }
    async countLikes(targetType, targetId) {
        return await this._countLikes(targetType, targetId);
    }
    async _toggleLike(user, targetType, targetId) {
        const target = await this.targetRepo.findOne({
            where: { targetType, targetId },
        });
        if (!target)
            throw new common_1.NotFoundException('Target not found');
        const existing = await this.likeRepo.findOne({
            where: { user, engagement: target },
        });
        if (existing) {
            const result = await this.likeRepo.remove(existing);
            this.engagementEmitter.emit(enums_1.EngagementEvent.LIKE_DELETED, {
                like: result,
            });
            return result;
        }
        const like = this.likeRepo.create({
            user,
            engagement: target,
            targetId: target.id,
            targetType: targetType,
        });
        const saved = await this.likeRepo.save(like);
        this.engagementEmitter.emit(enums_1.EngagementEvent.LIKE_CREATED, { like: saved });
        return saved;
    }
    async _countLikes(targetType, targetId) {
        const target = await this.targetRepo.findOne({
            where: { targetType, targetId },
        });
        console.log('Likes count for:', targetType, targetId, target);
        if (!target)
            return 0;
        return this.likeRepo.count({
            where: { engagement: { id: target.id } },
            relations: ['engagement'],
        });
    }
};
exports.LikeService = LikeService;
exports.LikeService = LikeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectDataSource)()),
    __param(1, (0, typeorm_2.InjectRepository)(engagement_target_entity_1.EngagementTarget)),
    __param(2, (0, common_1.Inject)(constants_1.UserEntityKey)),
    __param(3, (0, common_1.Inject)(constants_1.EngagementOptionsKey)),
    __param(5, (0, typeorm_2.InjectRepository)(like_entity_1.Like)),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        typeorm_1.Repository, Object, Object, engagement_emitter_1.EngagementEmitter,
        typeorm_1.Repository])
], LikeService);
