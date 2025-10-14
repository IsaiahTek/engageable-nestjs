import { EntityTarget } from 'typeorm';
export interface EngagementOptions {
    /**
     * Whether to automatically create an EngagementTarget when entity is created.
     * Default: true
     */
    autoCreateTargets?: boolean;
    /**
     * Whether to use lazy linking (create targets only when first liked/commented)
     * Default: true
     */
    lazyLinking?: boolean;
    /**
     * Register engageable entities (optional, used if autoCreateTargets = true)
     */
    engageableEntities?: string[];
    /**
     * Emit events for engagement actions
     * Default: true
     */
    emitEvents?: boolean;
    /**
     * User entity
     * Default: null
     */
    userEntity?: EntityTarget<any> | null;
    /**
     * Allow unauthenticated users to like/comment entity
     * Default: false
     */
    allowAnonymous?: boolean;
    /**
     * Auth guard to use for anonymous comments
     * Default: canActivate: () => true
     */
    authGuard?: any;
}
