import { BaseEntity } from './base/base.entity';
import { Like } from './like.entity';
export declare class Comment extends BaseEntity {
    content: string;
    userId: string;
    targetId: string;
    targetType: string;
    parent?: Comment;
    replies: Comment[];
    likes: Like[];
    user?: any;
}
