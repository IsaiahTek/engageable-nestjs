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
exports.EngagementActionService = void 0;
const typeorm_1 = require("@nestjs/typeorm");
const engagement_service_1 = require("./engagement.service");
const typeorm_2 = require("typeorm");
const engagement_action_entity_1 = require("../entities/engagement-action.entity");
const common_1 = require("@nestjs/common");
const engagement_emitter_1 = require("../event-emitters/engagement.emitter");
const constants_1 = require("../utils/constants");
const enums_1 = require("../utils/enums");
let EngagementActionService = class EngagementActionService extends engagement_service_1.EngagementService {
    constructor(dataSource, userEntity, options, engagementEmitter, actionRepository) {
        super(dataSource, userEntity, options, engagementEmitter);
        this.dataSource = dataSource;
        this.userEntity = userEntity;
        this.options = options;
        this.engagementEmitter = engagementEmitter;
        this.actionRepository = actionRepository;
    }
    async toggleAction(userId, targetType, targetId, type, metadata) {
        const existing = await this.actionRepository.findOne({
            where: { userId, targetId, targetType, type },
        });
        if (existing) {
            await this.actionRepository.remove(existing);
            this.engagementEmitter.emit(enums_1.EngagementEvent.ACTION_DELETED, {
                result: { id: existing.id },
                type,
            });
            return { removed: true };
        }
        const action = this.actionRepository.create({
            userId,
            targetType,
            targetId,
            type,
            metadata,
        });
        const saved = await this.actionRepository.save(action);
        this.engagementEmitter.emit(enums_1.EngagementEvent.ACTION_CREATED, {
            saved,
            type,
        });
        return { created: true, action: saved };
    }
    async getAllActions(action) {
        return this.actionRepository.find({
            relations: ['user'],
            where: { type: action },
            order: { createdAt: 'DESC' },
        });
    }
    async countActions(targetType, targetId, action) {
        return await this._countActions(targetType, targetId, action);
    }
    async _countActions(targetType, targetId, action) {
        return this.actionRepository.count({
            where: {
                targetType,
                targetId,
                type: action,
            },
        });
    }
};
exports.EngagementActionService = EngagementActionService;
exports.EngagementActionService = EngagementActionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __param(1, (0, common_1.Inject)(constants_1.UserEntityKey)),
    __param(2, (0, common_1.Inject)(constants_1.EngagementOptionsKey)),
    __param(4, (0, typeorm_1.InjectRepository)(engagement_action_entity_1.EngagementAction)),
    __metadata("design:paramtypes", [typeorm_2.DataSource, Object, Object, engagement_emitter_1.EngagementEmitter,
        typeorm_2.Repository])
], EngagementActionService);
//# sourceMappingURL=engagement-action.service.js.map