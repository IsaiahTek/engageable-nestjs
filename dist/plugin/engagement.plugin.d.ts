import { DataSource, ObjectLiteral, Repository } from 'typeorm';
import { EngagementTarget } from '../entities/engagement-target.entity';
interface GetEngageablesOptions<T extends ObjectLiteral> {
    rootType: string;
    repository: Repository<T>;
    dataSource: DataSource;
    where?: any;
    pagination?: {
        page?: number;
        limit?: number;
    };
    transform?: (item: T) => Promise<any> | any;
}
/**
 * Public static API users can call to get paginated engageables with engagements.
 */
export declare class EngageablePlugin {
    static getEngageablesWithEngagements<T extends ObjectLiteral>({ rootType, repository, dataSource, where, pagination, transform, }: GetEngageablesOptions<T>): Promise<{
        data: never[];
        total: number;
        page: number;
        limit: number;
        totalPages?: undefined;
    } | {
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
/**
 * Main utility for plugin users to fetch entities with fully nested engagement data.
 */
export declare function getEngagedEntities<T extends {
    id: string;
    engagement: EngagementTarget | null;
}>(dataSource: DataSource, entityRepo: Repository<T>, targetType: string, options?: {
    where?: any;
    order?: any;
    page?: number;
    limit?: number;
}): Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}>;
export {};
