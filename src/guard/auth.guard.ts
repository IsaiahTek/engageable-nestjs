// src/guards/engagement-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { AUTH_GUARD_KEY } from '../utils/constants';

@Injectable()
export class EngagementAuthGuard implements CanActivate {
  private resolvedGuard: CanActivate | null = null;

  constructor(private moduleRef: ModuleRef) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Resolve the host app’s actual auth guard dynamically
    if (!this.resolvedGuard) {
      try {
        this.resolvedGuard = this.moduleRef.get(AUTH_GUARD_KEY, { strict: false });
      } catch {
        throw new Error(
          `Auth guard with token "${AUTH_GUARD_KEY}" not found. Please register it in your AppModule.`,
        );
      }
    }

    const result = await Promise.resolve(this.resolvedGuard?.canActivate(context));

    // Ensure the guard actually attached a user to the request
    const request = context.switchToHttp().getRequest();
    if (!request.user) {
      console.warn(
        `[EngagementAuthGuard] The resolved guard did not attach a user to request.user`,
      );
    }
    console.log("Request seen as", request.user);
    return result as boolean;
  }
}
