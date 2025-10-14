import { DynamicModule } from '@nestjs/common';
import { EngagementOptions } from './interfaces/engagement-options.interface';
export declare class EngagementModule {
    static register(options?: EngagementOptions): DynamicModule;
}
