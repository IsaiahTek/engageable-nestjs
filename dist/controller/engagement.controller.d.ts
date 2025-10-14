import { EngagementService } from '../service/engagement.service';
import { CommentDto } from '../dto/comment.dto';
import { CommentService } from '../service/comment.service';
import { EngagementActionService } from '../service/engagement-action.service';
import { EngagementActionType } from '../interfaces/user_entity.type';
import { LikeService } from '../service/like.service';
export declare class EngagementController {
    private readonly service;
    private readonly actionService;
    private readonly commentService;
    private readonly likeService;
    private readonly AuthGuard;
    constructor(service: EngagementService, actionService: EngagementActionService, commentService: CommentService, likeService: LikeService, AuthGuard: any);
    private checkIsRegisteredRoute;
    getTarget(targetType: string, targetId: string): Promise<import("../entities/engagement-target.entity").EngagementTarget>;
    getTargets(): Promise<any[]>;
    getAllComments(): Promise<import("../entities/comment.entity").Comment[]>;
    getAllLikes(action: EngagementActionType): Promise<import("../entities/engagement-action.entity").EngagementAction[]>;
    deleteTarget(targetType: string, targetId: string): Promise<import("../entities/engagement-target.entity").EngagementTarget>;
    deleteTargets(): Promise<import("typeorm").DeleteResult>;
    countLikes(targetType: string, targetId: string): Promise<{
        count: number;
    }>;
    addLike(targetType: string, targetId: string, req: any): Promise<import("../entities/like.entity").Like>;
    addComment(targetType: string, targetId: string, commentDto: CommentDto, req: any): Promise<import("../entities/comment.entity").Comment>;
    getComments(targetType: string, targetId: string): Promise<import("../entities/comment.entity").Comment[]>;
    deleteLike(targetType: string, targetId: string, commentId: string): Promise<void>;
    updateComment(targetType: string, targetId: string, commentId: string, commentDto: CommentDto): Promise<import("../entities/comment.entity").Comment>;
    countActions(targetType: string, targetId: string, action: EngagementActionType): Promise<{
        count: number;
    }>;
    toggleLike(targetType: string, targetId: string, action: EngagementActionType, req: any): Promise<{
        removed: boolean;
        created?: undefined;
        action?: undefined;
    } | {
        created: boolean;
        action: import("../entities/engagement-action.entity").EngagementAction;
        removed?: undefined;
    }>;
}
