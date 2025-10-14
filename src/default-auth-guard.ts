import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class DefaultEngagementAuthGuard implements CanActivate {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate(context: ExecutionContext): boolean {
    // Default behavior if developer didn’t specify any guard
    return true;
  }
}
