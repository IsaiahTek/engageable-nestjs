// review.service.ts

import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { EngagementService } from "./engagement.service";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
// import { EngagementTarget } from "../entities/engagement-target.entity"; // REMOVED
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
    // @InjectRepository(EngagementTarget) // REMOVED
    // protected targetRepo: Repository<EngagementTarget>, // REMOVED
    @Inject(UserEntityKey) protected readonly userEntity: any,
    @Inject(EngagementOptionsKey) protected options: EngagementOptions,
    protected readonly engagementEmitter: EngagementEmitter,
    @InjectRepository(Review)
    protected reviewRepo: Repository<Review>,
  ) {
    // Corrected super() call to match the simplified EngagementService
    super(dataSource, userEntity, options, engagementEmitter);
  }

  async getAllReviews(pagination?: { page?: number; limit?: number }) {
    const page = Math.max(pagination?.page || 1, 1);
    const limit = Math.max(pagination?.limit || 20, 1);
    const skip = (page - 1) * limit;

    const [data, total] = await this.reviewRepo.findAndCount({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async addReview(userId: any, targetType: string, targetId: string, review: ReviewDto) {
    if (this.hasUserSupport && !this.options.allowAnonymous) {
      if (!userId) {
        throw new ForbiddenException('Authentication required to review');
      }

      const userRepo = this.dataSource.getRepository(this.userEntity);
      const user = await userRepo.findOne({ where: { id: userId } });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return this._addReview({ user, targetType, targetId, review });
    } else {
      return this._addReview({ user: null, targetType, targetId, review });
    }
  }

  async _addReview({ user, targetType, targetId, review }: { user: any; targetType: string; targetId: string; review: ReviewDto }) {
    const addedReview = this.reviewRepo.create({
      text: review.text,
      rating: review.rating,
      user,
      targetId,
      targetType,
    });
    await this.reviewRepo.save(addedReview);

    this.engagementEmitter.emit(EngagementEvent.REVIEW_CREATED, {
      review: addedReview,
    });
    return addedReview;
  }

  async getReviews(targetType: string, targetId: string, pagination?: { page?: number; limit?: number }) {
    return this._getReviews(targetType, targetId, pagination);
  }

  async _getReviews(targetType: string, targetId: string, pagination?: { page?: number; limit?: number }) {
    if (pagination?.page || pagination?.limit) {
      const page = Math.max(pagination.page || 1, 1);
      const limit = Math.max(pagination.limit || 20, 1);
      const skip = (page - 1) * limit;

      const [data, total] = await this.reviewRepo.findAndCount({
        where: { targetType, targetId },
        relations: ['user'],
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }

    return this.reviewRepo.find({
      where: { 
        targetType,
        targetId,
      },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getReviewSummary(targetType: string, targetId: string) {
    const reviews = await this.reviewRepo.find({
      where: { targetType, targetId },
      select: ['rating'],
    });

    const totalReviews = reviews.length;
    if (totalReviews === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0, 0: 0 },
      };
    }

    let sum = 0;
    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0, 0: 0 };

    for (const r of reviews) {
      const rating = Number(r.rating) || 0;
      sum += rating;
      const floorStar = Math.min(5, Math.max(0, Math.floor(rating)));
      distribution[floorStar] = (distribution[floorStar] || 0) + 1;
    }

    const averageRating = Math.round((sum / totalReviews) * 100) / 100;

    return {
      averageRating,
      totalReviews,
      distribution,
    };
  }

  async deleteReview(reviewId: string, userId?: string) {
    const review = await this.reviewRepo.findOne({
      where: { id: reviewId },
    });
    if (!review) throw new NotFoundException('Review not found');

    if (userId && review.userId && review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    const result = await this.reviewRepo.remove(review);
    this.engagementEmitter.emit(EngagementEvent.REVIEW_DELETED, { reviewId });
    return result;
  }

  async updateReview(reviewId: string, reviewDto: ReviewDto, userId?: string) {
    const review = await this.reviewRepo.findOne({
      where: { id: reviewId },
    });
    if (!review) throw new NotFoundException('Review not found');

    if (userId && review.userId && review.userId !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    review.text = reviewDto.text;
    review.rating = reviewDto.rating;
    return this.reviewRepo.save(review);
  }
}