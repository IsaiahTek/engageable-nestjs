import { EngagementService } from "./engagement.service";
import { EngagementEmitter } from "../event-emitters/engagement.emitter";
import { EngagementOptions } from "../interfaces/engagement-options.interface";
import { DataSource, Repository } from "typeorm";
import { Review } from "../entities/review.entity";
import { ReviewDto } from "../dto/review.dto";
export declare class ReviewService extends EngagementService {
    protected readonly dataSource: DataSource;
    protected readonly userEntity: any;
    protected options: EngagementOptions;
    protected readonly engagementEmitter: EngagementEmitter;
    protected reviewRepo: Repository<Review>;
    constructor(dataSource: DataSource, userEntity: any, options: EngagementOptions, engagementEmitter: EngagementEmitter, reviewRepo: Repository<Review>);
    getAllReviews(): Promise<Review[]>;
    addReview(userId: any, targetType: string, targetId: string, review: ReviewDto): Promise<Review>;
    _addReview({ user, targetType, targetId, review }: {
        user: any;
        targetType: string;
        targetId: string;
        review: ReviewDto;
    }): Promise<Review>;
    getReviews(targetType: string, targetId: string): Promise<Review[]>;
    _getReviews(targetType: string, targetId: string): Promise<Review[]>;
    deleteReview(reviewId: string): Promise<Review>;
    updateReview(reviewId: string, reviewDto: ReviewDto): Promise<Review>;
}
