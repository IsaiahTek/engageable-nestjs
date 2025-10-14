import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class DefaultEngagementAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
