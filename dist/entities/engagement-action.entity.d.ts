import { EngagementTarget } from './engagement-target.entity';
import { BaseEntity } from './base/base.entity';
export declare class EngagementAction extends BaseEntity {
    userId?: string;
    targetId: string;
    targetType: string;
    engagement: EngagementTarget;
    type: 'repost' | 'bookmark' | 'share' | 'follow';
    metadata?: Record<string, any>;
    user?: any;
}
