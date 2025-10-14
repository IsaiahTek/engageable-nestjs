import { EntityTarget } from 'typeorm';
export interface EngagementOptions {
    autoCreateTargets?: boolean;
    lazyLinking?: boolean;
    engageableEntities?: string[];
    emitEvents?: boolean;
    userEntity?: EntityTarget<any> | null;
    allowAnonymous?: boolean;
    authGuard?: any;
}
