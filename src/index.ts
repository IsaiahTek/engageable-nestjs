// src/index.ts

// Example: Re-export the main module and public decorators/services
export * from './engagement.module';
export * from './decorators/engageable.decorator';
export * from './services/engagement.service';
export * from './services/engagement-action.service';
export * from './services/comment.service';
export * from './services/like.service';
export * from './entities/engagement-action.entity';
export * from './entities/comment.entity';
export * from './entities/engagement-target.entity';
export * from './entities/like.entity';
// ... any other public components

// Example: Re-export the plugin
export * from './plugin/engagement.plugin';

// Example: Re-export the utils
export { EngagementEvent } from './utils/enums';
export * from './utils/nest-engagements.util';

// Example: Re-export the constants
export { UserEntityKey, EngagementOptionsKey, AUTH_GUARD_KEY } from './utils/constants';

// Example: Re-export the interfaces
export * from './interfaces/engagement-options.interface';
export * from './interfaces/user_entity.type';

// Example: Re-export the decorators
export * from './decorators/auth.decorator';
