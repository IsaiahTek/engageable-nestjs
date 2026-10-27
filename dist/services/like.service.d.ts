import { DataSource, Repository } from 'typeorm';
import { Like } from '../entities/like.entity';
import { EngagementService } from './engagement.service';
import { EngagementEmitter } from '../event-emitters/engagement.emitter';
import { EngagementOptions } from '../interfaces/engagement-options.interface';
export declare class LikeService extends EngagementService {
    protected readonly dataSource: DataSource;
    protected readonly userEntity: any;
    protected options: EngagementOptions;
    protected readonly engagementEmitter: EngagementEmitter;
    protected likeRepo: Repository<Like>;
    constructor(dataSource: DataSource, userEntity: any, options: EngagementOptions, engagementEmitter: EngagementEmitter, likeRepo: Repository<Like>);
    getAllLikes(pagination?: {
        page?: number;
        limit?: number;
    }): Promise<{
        data: Like[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    toggleLike(userId: any, targetType: string, targetId: string): Promise<{
        liked: boolean;
        removed: Like;
        like?: undefined;
    } | {
        liked: boolean;
        like: Like;
        removed?: undefined;
    }>;
    countLikes(targetType: string, targetId: string): Promise<number>;
    _toggleLike(user: any, targetType: string, targetId: string): Promise<{
        liked: boolean;
        removed: Like;
        like?: undefined;
    } | {
        liked: boolean;
        like: Like;
        removed?: undefined;
    }>;
    private _countLikes;
}
