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