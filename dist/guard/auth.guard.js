"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngagementAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const constants_1 = require("../utils/constants");
let EngagementAuthGuard = class EngagementAuthGuard {
    constructor(moduleRef) {
        this.moduleRef = moduleRef;
        this.resolvedGuard = null;
    }
    async canActivate(context) {
        if (!this.resolvedGuard) {
            try {
                this.resolvedGuard = this.moduleRef.get(constants_1.AUTH_GUARD_KEY, { strict: false });
            }
            catch {
                throw new Error(`Auth guard with token "${constants_1.AUTH_GUARD_KEY}" not found. Please register it in your AppModule.`);
            }
        }
        const result = await Promise.resolve(this.resolvedGuard?.canActivate(context));
        const request = context.switchToHttp().getRequest();
        if (!request.user) {
            console.warn(`[EngagementAuthGuard] The resolved guard did not attach a user to request.user`);
        }
        console.log("Request seen as", request.user);
        return result;
    }
};
exports.EngagementAuthGuard = EngagementAuthGuard;
exports.EngagementAuthGuard = EngagementAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.ModuleRef])
], EngagementAuthGuard);
//# sourceMappingURL=auth.guard.js.map