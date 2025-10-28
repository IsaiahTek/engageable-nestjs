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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngagementService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const constants_1 = require("../utils/constants");
const engagement_emitter_1 = require("../event-emitters/engagement.emitter");
let EngagementService = class EngagementService {
    constructor(dataSource, userEntity, options, engagementEmitter) {
        this.dataSource = dataSource;
        this.userEntity = userEntity;
        this.options = options;
        this.engagementEmitter = engagementEmitter;
    }
    get hasUserSupport() {
        return !!this.userEntity;
    }
};
exports.EngagementService = EngagementService;
exports.EngagementService = EngagementService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __param(1, (0, common_1.Inject)(constants_1.UserEntityKey)),
    __param(2, (0, common_1.Inject)(constants_1.EngagementOptionsKey)),
    __metadata("design:paramtypes", [typeorm_2.DataSource, Object, Object, engagement_emitter_1.EngagementEmitter])
], EngagementService);
//# sourceMappingURL=engagement.service.js.map