import { DataSource, Repository } from 'typeorm';
import { Like } from '../entities/like.entity';
import { EngagementService } from './engagement.service';
import { EngagementTarget } from '../entities/engagement-target.entity';
import { EngagementEmitter } from '../event-emitters/engagement.emitter';
import { EngagementOptions } from '../interfaces/engagement-options.interface';
export declare class LikeService extends EngagementService {
    protected readonly dataSource: DataSource;
    protected targetRepo: Repository<EngagementTarget>;
    protected readonly userEntity: any;
    protected options: EngagementOptions;
    protected readonly engagementEmitter: EngagementEmitter;
    protected likeRepo: Repository<Like>;
    constructor(dataSource: DataSource, targetRepo: Repository<EngagementTarget>, userEntity: any, options: EngagementOptions, engagementEmitter: EngagementEmitter, likeRepo: Repository<Like>);
    getAllLikes(): Promise<Like[]>;
    toggleLike(userId: any, targetType: string, targetId: string): Promise<Like>;
    countLikes(targetType: string, targetId: string): Promise<number>;
    _toggleLike(user: any, targetType: string, targetId: string): Promise<Like>;
    private _countLikes;
}
