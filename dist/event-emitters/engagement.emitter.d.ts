import { EngagementEvent } from '../utils/enums';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EngagementOptions } from '../interfaces/engagement-options.interface';
export declare class EngagementEmitter {
    private options;
    private readonly eventEmitter;
    constructor(options: EngagementOptions, eventEmitter: EventEmitter2);
    emit(event: EngagementEvent, data: any): void;
}
