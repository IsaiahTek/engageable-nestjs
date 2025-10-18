import { BaseEntity } from "./base/base.entity";
import { EngagementTarget } from "./engagement-target.entity";
export declare class Review extends BaseEntity {
    text: string;
    rating: number;
    targetId: string;
    targetType: string;
    engagement: EngagementTarget;
    user?: any;
}
