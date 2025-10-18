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
exports.ReviewService = void 0;
const common_1 = require("@nestjs/common");
const engagement_service_1 = require("./engagement.service");
const typeorm_1 = require("@nestjs/typeorm");
const engagement_target_entity_1 = require("src/entities/engagement-target.entity");
const engagement_emitter_1 = require("src/event-emitters/engagement.emitter");
const constants_1 = require("src/utils/constants");
const typeorm_2 = require("typeorm");
const review_entity_1 = require("src/entities/review.entity");
const enums_1 = require("src/utils/enums");
let ReviewService = class ReviewService extends engagement_service_1.EngagementService {
    constructor(dataSource, targetRepo, userEntity, options, engagementEmitter, reviewRepo) {
        super(dataSource, targetRepo, userEntity, options, engagementEmitter);
        this.dataSource = dataSource;
        this.targetRepo = targetRepo;
        this.userEntity = userEntity;
        this.options = options;
        this.engagementEmitter = engagementEmitter;
        this.reviewRepo = reviewRepo;
    }
    async getAllReviews() {
        return this.reviewRepo.find({
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
    }
    async addReview(userId, targetType, targetId, review) {
        return this._addReview(userId, targetType, targetId, review);
    }
    async _addReview(userId, targetType, targetId, review) {
        const target = await this.ensureTarget(targetType, targetId);
        const reviewEntity = new review_entity_1.Review();
        reviewEntity.text = review.text;
        reviewEntity.rating = review.rating;
        reviewEntity.user = userId;
        reviewEntity.engagement = target;
        const addedReview = await this.reviewRepo.save(reviewEntity);
        this.engagementEmitter.emit(enums_1.EngagementEvent.REVIEW_CREATED, {
            review: addedReview,
        });
        return addedReview;
    }
    async getReviews(targetType, targetId) {
        return this._getReviews(targetType, targetId);
    }
    async _getReviews(targetType, targetId) {
        const target = await this.ensureTarget(targetType, targetId);
        return this.reviewRepo.find({
            where: { engagement: { id: target.id } },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
    }
    async deleteReview(reviewId) {
        const review = await this.reviewRepo.findOne({
            where: { id: reviewId },
        });
        if (!review)
            throw new common_1.NotFoundException('Review not found');
        return this.reviewRepo.remove(review);
    }
    async updateReview(reviewId, reviewDto) {
        const review = await this.reviewRepo.findOne({
            where: { id: reviewId },
        });
        if (!review)
            throw new common_1.NotFoundException('Review not found');
        review.text = reviewDto.text;
        review.rating = reviewDto.rating;
        return this.reviewRepo.save(review);
    }
};
exports.ReviewService = ReviewService;
exports.ReviewService = ReviewService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __param(1, (0, typeorm_1.InjectRepository)(engagement_target_entity_1.EngagementTarget)),
    __param(2, (0, common_1.Inject)(constants_1.UserEntityKey)),
    __param(3, (0, common_1.Inject)(constants_1.EngagementOptionsKey)),
    __param(5, (0, typeorm_1.InjectRepository)(review_entity_1.Review)),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        typeorm_2.Repository, Object, Object, engagement_emitter_1.EngagementEmitter,
        typeorm_2.Repository])
], ReviewService);
//# sourceMappingURL=review.service.js.map