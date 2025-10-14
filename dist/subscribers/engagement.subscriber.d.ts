import { DataSource, EntitySubscriberInterface, InsertEvent } from 'typeorm';
import { EngagementOptions } from '../interfaces/engagement-options.interface';
import { EngagementEmitter } from '../event-emitters/engagement.emitter';
export declare class EngagementSubscriber implements EntitySubscriberInterface<any> {
    private readonly dataSource;
    private options;
    private readonly engagementEmitter;
    constructor(dataSource: DataSource, options: EngagementOptions, engagementEmitter: EngagementEmitter);
    afterInsert(event: InsertEvent<any>): Promise<void>;
}
