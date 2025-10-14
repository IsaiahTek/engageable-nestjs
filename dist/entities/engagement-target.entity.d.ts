import { Like } from './like.entity';
import { Comment } from './comment.entity';
import { BaseEntity } from './base/base.entity';
import { EngagementAction } from './engagement-action.entity';
export declare class EngagementTarget extends BaseEntity {
    targetType: string;
    targetId: string;
    likes: Like[];
    comments: Comment[];
    actions: EngagementAction[];
}
