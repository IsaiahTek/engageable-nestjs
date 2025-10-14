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
const engagement_target_entity_1 = require("../entities/engagement-target.entity");
const engagement_emitter_1 = require("../event-emitters/engagement.emitter");
const constants_1 = require("../utils/constants");
const enums_1 = require("../utils/enums");
let EngagementActionService = class EngagementActionService extends engagement_service_1.EngagementService {
    constructor(dataSource, targetRepo, userEntity, options, engagementEmitter, actionRepository) {
        super(dataSource, targetRepo, userEntity, options, engagementEmitter);
        this.dataSource = dataSource;
        this.targetRepo = targetRepo;
        this.userEntity = userEntity;
        this.options = options;
        this.engagementEmitter = engagementEmitter;
        this.actionRepository = actionRepository;
    }
    async toggleAction(userId, targetType, targetId, type, metadata) {
        const target = await super.ensureTarget(targetType, targetId);
        const existing = await this.actionRepository.findOne({
            where: { userId, targetId, targetType, type },
        });
        if (existing) {
            await this.actionRepository.remove(existing);
            return { removed: true };
        }
        const action = this.actionRepository.create({
            userId,
            targetType,
            targetId,
            type,
            engagement: target,
            metadata,
        });
        await this.actionRepository.save(action);
        return { created: true, action };
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
    async _toggleAction(user, targetType, targetId, action) {
        const target = await this.targetRepo.findOne({
            where: { targetType, targetId },
        });
        if (!target)
            throw new common_1.NotFoundException('Target not found');
        const existing = await this.actionRepository.findOne({
            where: { user, engagement: target },
        });
        if (existing) {
            const result = await this.actionRepository.remove(existing);
            this.engagementEmitter.emit(enums_1.EngagementEvent.ACTION_DELETED, {
                result,
                action,
            });
            return result;
        }
        const like = this.actionRepository.create({
            user,
            engagement: target,
            type: action,
        });
        const saved = await this.actionRepository.save(like);
        this.engagementEmitter.emit(enums_1.EngagementEvent.ACTION_CREATED, {
            saved,
            type: action,
        });
        return saved;
    }
    async _countActions(targetType, targetId, action) {
        const target = await this.targetRepo.findOne({
            where: { targetType, targetId },
        });
        if (!target)
            return 0;
        const type = action;
        return this.actionRepository.count({
            where: { engagement: { id: target.id }, type },
            relations: ['target'],
        });
    }
};
exports.EngagementActionService = EngagementActionService;
exports.EngagementActionService = EngagementActionService = __decorate([
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __param(1, (0, typeorm_1.InjectRepository)(engagement_target_entity_1.EngagementTarget)),
    __param(2, (0, common_1.Inject)(constants_1.UserEntityKey)),
    __param(3, (0, common_1.Inject)(constants_1.EngagementOptionsKey)),
    __param(5, (0, typeorm_1.InjectRepository)(engagement_action_entity_1.EngagementAction)),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        typeorm_2.Repository, Object, Object, engagement_emitter_1.EngagementEmitter,
        typeorm_2.Repository])
], EngagementActionService);
//# sourceMappingURL=engagement-action.service.js.map