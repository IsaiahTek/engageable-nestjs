import { DataSource, ObjectLiteral, Repository } from 'typeorm';
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
export declare class EngageablePlugin {
    static getEngageablesWithEngagements<T extends ObjectLiteral>({ rootType, repository, dataSource, where, pagination, transform, }: GetEngageablesOptions<T>): Promise<{
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
export {};
