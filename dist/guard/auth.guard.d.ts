import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
export declare class EngagementAuthGuard implements CanActivate {
    private moduleRef;
    private resolvedGuard;
    constructor(moduleRef: ModuleRef);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
