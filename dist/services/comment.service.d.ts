import { Comment } from '../entities/comment.entity';
import { DataSource, Repository } from 'typeorm';
import { EngagementEmitter } from '../event-emitters/engagement.emitter';
import { EngagementService } from './engagement.service';
import { EngagementOptions } from '../interfaces/engagement-options.interface';
export declare class CommentService extends EngagementService {
    protected readonly dataSource: DataSource;
    protected readonly userEntity: any;
    protected options: EngagementOptions;
    protected readonly engagementEmitter: EngagementEmitter;
    protected commentRepo: Repository<Comment>;
    constructor(dataSource: DataSource, userEntity: any, options: EngagementOptions, engagementEmitter: EngagementEmitter, commentRepo: Repository<Comment>);
    addComment(userId: any, targetType: string, targetId: string, content: string, parentId?: string): Promise<Comment>;
    getComments(targetType: string, targetId: string): Promise<Comment[]>;
    removeComment(commentId: string, userId?: string): Promise<Comment>;
    updateComment(commentId: string, content: string, userId?: string): Promise<Comment>;
    getCommentReplies(commentId: string): Promise<Comment[]>;
    getAllComments(pagination?: {
        page?: number;
        limit?: number;
    }): Promise<{
        data: Comment[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    private _addComment;
    private _getComments;
    private _updateComment;
    private _removeComment;
}
