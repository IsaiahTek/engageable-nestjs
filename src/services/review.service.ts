import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { EngagementService } from "./engagement.service";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { EngagementTarget } from "../entities/engagement-target.entity";
import { EngagementEmitter } from "../event-emitters/engagement.emitter";
import { EngagementOptions } from "../interfaces/engagement-options.interface";
import { UserEntityKey, EngagementOptionsKey } from "../utils/constants";
import { DataSource, Repository } from "typeorm";
import { Review } from "../entities/review.entity";
import { EngagementEvent } from "../utils/enums";
import { ReviewDto } from "../dto/review.dto";

@Injectable()
export class ReviewService extends EngagementService {
    constructor(
        @InjectDataSource() protected readonly dataSource: DataSource,
        @InjectRepository(EngagementTarget)
        protected targetRepo: Repository<EngagementTarget>,
        @Inject(UserEntityKey) protected readonly userEntity: any,
        @Inject(EngagementOptionsKey) protected options: EngagementOptions,
        protected readonly engagementEmitter: EngagementEmitter,
        @InjectRepository(Review)
        protected reviewRepo: Repository<Review>,
    ) {
        super(dataSource, targetRepo, userEntity, options, engagementEmitter);
    }

    async getAllReviews() {
        console.log("Trying to fetch reviews")
        const result = await this.reviewRepo.find({
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });

        console.log("Reviews: ", result);
        return result;
    }

    async addReview(userId: any, targetType: string, targetId: string, review: ReviewDto) {
        return this._addReview(userId, targetType, targetId, review);
    }

    async _addReview(userId: any, targetType: string, targetId: string, review: ReviewDto) {
        const target = await this.ensureTarget(targetType, targetId);
        const reviewEntity = new Review();
        reviewEntity.text = review.text;
        reviewEntity.rating = review.rating;
        reviewEntity.user = userId;
        reviewEntity.engagement = target;
        const addedReview = await this.reviewRepo.save(reviewEntity);

        this.engagementEmitter.emit(EngagementEvent.REVIEW_CREATED, {
            review: addedReview,
        });
        return addedReview;
    }

    async getReviews(targetType: string, targetId: string) {
        return this._getReviews(targetType, targetId);
    }

    async _getReviews(targetType: string, targetId: string) {
        const target = await this.ensureTarget(targetType, targetId);
        return this.reviewRepo.find({
            where: { engagement: { id: target.id } },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
    }

    async deleteReview(reviewId: string) {
        const review = await this.reviewRepo.findOne({
            where: { id: reviewId },
        });
        if (!review) throw new NotFoundException('Review not found');
        return this.reviewRepo.remove(review);
    }

    async updateReview(reviewId: string, reviewDto: ReviewDto) {
        const review = await this.reviewRepo.findOne({
            where: { id: reviewId },
        });
        if (!review) throw new NotFoundException('Review not found');
        review.text = reviewDto.text;
        review.rating = reviewDto.rating;
        return this.reviewRepo.save(review);
    }
}