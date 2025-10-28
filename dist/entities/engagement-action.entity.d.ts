import { BaseEntity } from './base/base.entity';
export declare class EngagementAction extends BaseEntity {
    userId?: string;
    targetId: string;
    targetType: string;
    type: 'repost' | 'bookmark' | 'share' | 'follow';
    metadata?: Record<string, any>;
    user?: any;
}
