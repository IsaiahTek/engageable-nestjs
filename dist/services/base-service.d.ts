import { EngagementOptions } from '../interfaces/engagement-options.interface';
export declare class BaseService {
    protected readonly userEntity: any;
    protected options: EngagementOptions;
    constructor(userEntity: any, options: EngagementOptions);
}
