import { EngagementTarget } from './engagement-target.entity';
import { BaseEntity } from './base/base.entity';
import { Like } from './like.entity';
export declare class Comment extends BaseEntity {
    content: string;
    userId: string;
    targetId: string;
    targetType: string;
    engagement: EngagementTarget;
    parent?: Comment;
    replies: Comment[];
    likes: Like[];
    user?: any;
}
