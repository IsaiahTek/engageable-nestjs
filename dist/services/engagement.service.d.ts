import { DataSource, Repository } from 'typeorm';
import { EngagementTarget } from '../entities/engagement-target.entity';
import { EngagementOptions } from '../interfaces/engagement-options.interface';
import { EngagementEmitter } from '../event-emitters/engagement.emitter';
export declare class EngagementService {
    protected readonly dataSource: DataSource;
    protected targetRepo: Repository<EngagementTarget>;
    protected readonly userEntity: any;
    protected options: EngagementOptions;
    protected readonly engagementEmitter: EngagementEmitter;
    constructor(dataSource: DataSource, targetRepo: Repository<EngagementTarget>, userEntity: any, options: EngagementOptions, engagementEmitter: EngagementEmitter);
    get hasUserSupport(): boolean;
    ensureTarget(targetType: string, targetId: string): Promise<EngagementTarget>;
    deleteTarget(targetType: string, targetId: string): Promise<EngagementTarget>;
    getTarget(targetType: string, targetId: string): Promise<EngagementTarget>;
    getTargets(): Promise<any[]>;
    deleteTargets(): Promise<import("typeorm").DeleteResult>;
}
