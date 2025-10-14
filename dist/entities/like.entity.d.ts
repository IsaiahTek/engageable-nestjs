import { EngagementTarget } from './engagement-target.entity';
import { BaseEntity } from './base/base.entity';
import { Comment } from './comment.entity';
export declare class Like extends BaseEntity {
    userId: string;
    targetId: string;
    targetType: string;
    engagement: EngagementTarget;
    parent: Like;
    comment: Comment;
    user?: any;
}
