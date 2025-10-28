import { BaseEntity } from "./base/base.entity";
export declare class Review extends BaseEntity {
    userId: string;
    text: string;
    rating: number;
    targetId?: string;
    targetType: string;
    user?: any;
}
