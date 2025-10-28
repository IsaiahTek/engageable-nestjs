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
    private checkIsRegisteredRoute;
    getAllComments(): Promise<import("..").Comment[]>;
    getAllRevies(): Promise<import("..").Review[]>;
    getAllActions(action: EngagementActionType): Promise<import("..").EngagementAction[]>;
    countLikes(targetType: string, targetId: string): Promise<{
        count: number;
    }>;
    toggleLike(targetType: string, targetId: string, req: any): Promise<import("..").Like>;
    getComments(targetType: string, targetId: string): Promise<import("..").Comment[]>;
    addComment(targetType: string, targetId: string, commentDto: CommentDto, req: any): Promise<import("..").Comment>;
    deleteComment(targetType: string, targetId: string, commentId: string): Promise<import("..").Comment>;
    updateComment(targetType: string, targetId: string, commentId: string, commentDto: CommentDto): Promise<import("..").Comment>;
    getReviews(targetType: string, targetId: string): Promise<import("..").Review[]>;
    addReview(targetType: string, targetId: string, reviewDto: ReviewDto, req: any): Promise<import("..").Review>;
    updateReview(targetType: string, targetId: string, reviewId: string, reviewDto: ReviewDto): Promise<import("..").Review>;
    deleteReview(targetType: string, targetId: string, reviewId: string): Promise<import("..").Review>;
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
