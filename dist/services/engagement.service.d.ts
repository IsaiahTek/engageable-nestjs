import { DataSource } from 'typeorm';
import { EngagementOptions } from '../interfaces/engagement-options.interface';
import { EngagementEmitter } from '../event-emitters/engagement.emitter';
export declare class EngagementService {
    protected readonly dataSource: DataSource;
    protected readonly userEntity: any;
    protected options: EngagementOptions;
    protected readonly engagementEmitter: EngagementEmitter;
    constructor(dataSource: DataSource, userEntity: any, options: EngagementOptions, engagementEmitter: EngagementEmitter);
    get hasUserSupport(): boolean;
}
