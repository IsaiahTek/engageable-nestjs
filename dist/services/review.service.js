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
const engagement_emitter_1 = require("../event-emitters/engagement.emitter");
const constants_1 = require("../utils/constants");
const typeorm_2 = require("typeorm");
const review_entity_1 = require("../entities/review.entity");
const enums_1 = require("../utils/enums");
let ReviewService = class ReviewService extends engagement_service_1.EngagementService {
    constructor(dataSource, userEntity, options, engagementEmitter, reviewRepo) {
        super(dataSource, userEntity, options, engagementEmitter);
        this.dataSource = dataSource;
        this.userEntity = userEntity;
        this.options = options;
        this.engagementEmitter = engagementEmitter;
        this.reviewRepo = reviewRepo;
    }
    async getAllReviews() {
        console.log("Trying to fetch reviews");
        const result = await this.reviewRepo.find({
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
        console.log("Reviews: ", result);
        return result;
    }
    async addReview(userId, targetType, targetId, review) {
        if (this.hasUserSupport && !this.options.allowAnonymous) {
            if (!userId) {
                throw new common_1.ForbiddenException('Authentication required to review');
            }
            const userRepo = this.dataSource.getRepository(this.userEntity);
            const user = await userRepo.findOne({ where: { id: userId } });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            return this._addReview({ user, targetType, targetId, review });
        }
        else {
            return this._addReview({ user: null, targetType, targetId, review });
        }
    }
    async _addReview({ user, targetType, targetId, review }) {
        console.log("About to add review: ", user, targetType, targetId, review);
        const addedReview = this.reviewRepo.create({
            text: review.text,
            rating: review.rating,
            user,
            targetId: targetId,
            targetType: targetType,
        });
        await this.reviewRepo.save(addedReview);
        this.engagementEmitter.emit(enums_1.EngagementEvent.REVIEW_CREATED, {
            review: addedReview,
        });
        console.log("Added review: ", addedReview, user, targetType, targetId, review);
        return addedReview;
    }
    async getReviews(targetType, targetId) {
        return this._getReviews(targetType, targetId);
    }
    async _getReviews(targetType, targetId) {
        return this.reviewRepo.find({
            where: {
                targetType,
                targetId
            },
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
        const result = await this.reviewRepo.remove(review);
        this.engagementEmitter.emit(enums_1.EngagementEvent.REVIEW_DELETED, { reviewId });
        return result;
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
    __param(1, (0, common_1.Inject)(constants_1.UserEntityKey)),
    __param(2, (0, common_1.Inject)(constants_1.EngagementOptionsKey)),
    __param(4, (0, typeorm_1.InjectRepository)(review_entity_1.Review)),
    __metadata("design:paramtypes", [typeorm_2.DataSource, Object, Object, engagement_emitter_1.EngagementEmitter,
        typeorm_2.Repository])
], ReviewService);
//# sourceMappingURL=review.service.js.map