// src/decorators/engagement-auth.decorator.ts
import { UseGuards, applyDecorators } from '@nestjs/common';
import { EngagementAuthGuard } from '../guard/auth.guard';

/**
 * Dynamically attaches the engagement auth guard from the module's provider.
 */
export function UseEngagementAuth() {
  return applyDecorators(UseGuards(EngagementAuthGuard));
}
