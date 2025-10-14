"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UseEngagementAuth = UseEngagementAuth;
// src/decorators/engagement-auth.decorator.ts
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../guard/auth.guard");
/**
 * Dynamically attaches the engagement auth guard from the module's provider.
 */
function UseEngagementAuth() {
    return (0, common_1.applyDecorators)((0, common_1.UseGuards)(auth_guard_1.EngagementAuthGuard));
}
