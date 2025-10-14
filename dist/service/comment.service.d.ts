import { Comment } from '../entities/comment.entity';
import { DataSource, Repository } from 'typeorm';
import { EngagementEmitter } from '../event-emitters/engagement.emitter';
import { EngagementService } from './engagement.service';
import { EngagementTarget } from '../entities/engagement-target.entity';
import { EngagementOptions } from '../interfaces/engagement-options.interface';
export declare class CommentService extends EngagementService {
    protected readonly dataSource: DataSource;
    protected targetRepo: Repository<EngagementTarget>;
    protected readonly userEntity: any;
    protected options: EngagementOptions;
    protected readonly engagementEmitter: EngagementEmitter;
    protected commentRepo: Repository<Comment>;
    constructor(dataSource: DataSource, targetRepo: Repository<EngagementTarget>, userEntity: any, options: EngagementOptions, engagementEmitter: EngagementEmitter, commentRepo: Repository<Comment>);
    addComment(user: any, targetType: string, targetId: string, content: string): Promise<Comment>;
    getComments(targetType: string, targetId: string): Promise<Comment[]>;
    removeComment(commentId: string): Promise<void>;
    updateComment(commentId: string, content: string): Promise<Comment>;
    getCommentReplies(commentId: string): Promise<Comment[]>;
    getAllComments(): Promise<Comment[]>;
    private buildCommentTree;
    private _addComment;
    private _getComments;
    private _updateComment;
    private _removeComment;
}
