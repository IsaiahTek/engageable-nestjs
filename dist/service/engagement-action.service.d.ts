import { EngagementActionType } from '../interfaces/user_entity.type';
import { EngagementService } from './engagement.service';
import { DataSource, Repository } from 'typeorm';
import { EngagementAction } from '../entities/engagement-action.entity';
import { EngagementTarget } from '../entities/engagement-target.entity';
import { EngagementEmitter } from '../event-emitters/engagement.emitter';
import { EngagementOptions } from '../interfaces/engagement-options.interface';
export declare class EngagementActionService extends EngagementService {
    protected readonly dataSource: DataSource;
    protected targetRepo: Repository<EngagementTarget>;
    protected readonly userEntity: any;
    protected options: EngagementOptions;
    protected readonly engagementEmitter: EngagementEmitter;
    private readonly actionRepository;
    constructor(dataSource: DataSource, targetRepo: Repository<EngagementTarget>, userEntity: any, options: EngagementOptions, engagementEmitter: EngagementEmitter, actionRepository: Repository<EngagementAction>);
    toggleAction(userId: string, targetType: string, targetId: string, type: EngagementActionType, metadata?: Record<string, any>): Promise<{
        removed: boolean;
        created?: undefined;
        action?: undefined;
    } | {
        created: boolean;
        action: EngagementAction;
        removed?: undefined;
    }>;
    getAllActions(action: EngagementActionType): Promise<EngagementAction[]>;
    countActions(targetType: string, targetId: string, action: EngagementActionType): Promise<number>;
    _toggleAction(user: any, targetType: string, targetId: string, action: EngagementActionType): Promise<EngagementAction>;
    private _countActions;
}
