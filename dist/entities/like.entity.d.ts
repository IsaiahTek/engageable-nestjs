import { BaseEntity } from './base/base.entity';
import { Comment } from './comment.entity';
export declare class Like extends BaseEntity {
    userId: string;
    targetId: string;
    targetType: string;
    parent: Like;
    children: Like[];
    comment: Comment;
    user?: any;
}
