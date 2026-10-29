// src/index.ts

// Module & Controller
export * from './engagement.module';
export * from './controller/engagement.controller';

// Decorators
export * from './decorators/engageable.decorator';
export * from './decorators/auth.decorator';
export * from './decorators/is-half-step.decorator';

// Services & Emitter
export * from './services/engagement.service';
export * from './services/engagement-action.service';
export * from './services/comment.service';
export * from './services/like.service';
export * from './services/review.service';
export * from './event-emitters/engagement.emitter';

// Entities
export * from './entities/engagement-action.entity';
export * from './entities/comment.entity';
export * from './entities/like.entity';
export * from './entities/review.entity';

// DTOs
export * from './dto/comment.dto';
export * from './dto/review.dto';

// Registry
export * from './registry/engagement.registry';

// Plugin
export * from './plugin/engagement.plugin';

// Utils & Helpers
export { registerUserRelation } from './utils/register-user-relation';
export { EngagementEvent } from './utils/enums';
export { UserEntityKey, EngagementOptionsKey, AUTH_GUARD_KEY } from './utils/constants';

// Interfaces & Types
export * from './interfaces/engagement-options.interface';
export * from './interfaces/user_entity.type';

// Guard
export * from './default-auth-guard';
