import { EngagementService } from '../services/engagement.service';
import { CommentDto } from '../dto/comment.dto';
import { CommentService } from '../services/comment.service';
import { EngagementActionService } from '../services/engagement-action.service';
import { EngagementActionType } from '../interfaces/user_entity.type';
import { LikeService } from '../services/like.service';
import { ReviewService } from 'src/services/review.service';
import { ReviewDto } from 'src/dto/review.dto';
export declare class EngagementController {
    private readonly service;
    private readonly actionService;
    private readonly commentService;
    private readonly likeService;
    private readonly reviewService;
    private readonly AuthGuard;
    constructor(service: EngagementService, actionService: EngagementActionService, commentService: CommentService, likeService: LikeService, reviewService: ReviewService, AuthGuard: any);
    private checkIsRegisteredRoute;
    getTarget(targetType: string, targetId: string): Promise<import("..").EngagementTarget>;
    getTargets(): Promise<any[]>;
    getAllComments(): Promise<import("..").Comment[]>;
    getAllLikes(action: EngagementActionType): Promise<import("..").EngagementAction[]>;
    deleteTarget(targetType: string, targetId: string): Promise<import("..").EngagementTarget>;
    deleteTargets(): Promise<import("typeorm").DeleteResult>;
    countLikes(targetType: string, targetId: string): Promise<{
        count: number;
    }>;
    addLike(targetType: string, targetId: string, req: any): Promise<import("..").Like>;
    addComment(targetType: string, targetId: string, commentDto: CommentDto, req: any): Promise<import("..").Comment>;
    getComments(targetType: string, targetId: string): Promise<import("..").Comment[]>;
    deleteLike(targetType: string, targetId: string, commentId: string): Promise<void>;
    updateComment(targetType: string, targetId: string, commentId: string, commentDto: CommentDto): Promise<import("..").Comment>;
    getReviews(targetType: string, targetId: string): Promise<import("../entities/review.entity").Review[]>;
    addReview(targetType: string, targetId: string, reviewDto: ReviewDto, req: any): Promise<import("../entities/review.entity").Review>;
    updateReview(targetType: string, targetId: string, reviewId: string, reviewDto: ReviewDto): Promise<import("../entities/review.entity").Review>;
    deleteReview(targetType: string, targetId: string, reviewId: string): Promise<import("../entities/review.entity").Review>;
    countActions(targetType: string, targetId: string, action: EngagementActionType): Promise<{
        count: number;
    }>;
    toggleLike(targetType: string, targetId: string, action: EngagementActionType, req: any): Promise<{
        removed: boolean;
        created?: undefined;
        action?: undefined;
    } | {
        created: boolean;
        action: import("..").EngagementAction;
        removed?: undefined;
    }>;
}
