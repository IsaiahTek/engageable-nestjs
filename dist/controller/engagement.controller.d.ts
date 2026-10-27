import { EngagementService } from '../services/engagement.service';
import { CommentDto } from '../dto/comment.dto';
import { CommentService } from '../services/comment.service';
import { EngagementActionService } from '../services/engagement-action.service';
import { EngagementActionType } from '../interfaces/user_entity.type';
import { LikeService } from '../services/like.service';
import { ReviewService } from '../services/review.service';
import { ReviewDto } from '../dto/review.dto';
export declare class EngagementController {
    private readonly service;
    private readonly actionService;
    private readonly commentService;
    private readonly likeService;
    private readonly reviewService;
    private readonly AuthGuard;
    constructor(service: EngagementService, actionService: EngagementActionService, commentService: CommentService, likeService: LikeService, reviewService: ReviewService, AuthGuard: any);
    private extractUserId;
    private checkIsRegisteredRoute;
    getAllLikes(page?: number, limit?: number): Promise<{
        data: import("..").Like[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getAllComments(page?: number, limit?: number): Promise<{
        data: import("..").Comment[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getAllReviews(page?: number, limit?: number): Promise<{
        data: import("..").Review[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getAllActions(action: EngagementActionType, page?: number, limit?: number): Promise<{
        data: import("..").EngagementAction[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    countLikes(targetType: string, targetId: string): Promise<{
        count: number;
    }>;
    toggleLike(targetType: string, targetId: string, req: any): Promise<{
        liked: boolean;
        removed: import("..").Like;
        like?: undefined;
    } | {
        liked: boolean;
        like: import("..").Like;
        removed?: undefined;
    }>;
    getComments(targetType: string, targetId: string): Promise<import("..").Comment[]>;
    addComment(targetType: string, targetId: string, commentDto: CommentDto, req: any): Promise<import("..").Comment>;
    deleteComment(targetType: string, targetId: string, commentId: string, req: any): Promise<import("..").Comment>;
    updateComment(targetType: string, targetId: string, commentId: string, commentDto: CommentDto, req: any): Promise<import("..").Comment>;
    getReviewSummary(targetType: string, targetId: string): Promise<{
        averageRating: number;
        totalReviews: number;
        distribution: Record<number, number>;
    }>;
    getReviews(targetType: string, targetId: string, page?: number, limit?: number): Promise<import("..").Review[] | {
        data: import("..").Review[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    addReview(targetType: string, targetId: string, reviewDto: ReviewDto, req: any): Promise<import("..").Review>;
    updateReview(targetType: string, targetId: string, reviewId: string, reviewDto: ReviewDto, req: any): Promise<import("..").Review>;
    deleteReview(targetType: string, targetId: string, reviewId: string, req: any): Promise<import("..").Review>;
    countActions(targetType: string, targetId: string, action: EngagementActionType): Promise<{
        count: number;
    }>;
    toggleAction(targetType: string, targetId: string, action: EngagementActionType, req: any): Promise<{
        removed: boolean;
        created?: undefined;
        action?: undefined;
    } | {
        created: boolean;
        action: import("..").EngagementAction;
        removed?: undefined;
    }>;
}
