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
const engagement_target_entity_1 = require("../entities/engagement-target.entity");
const constants_1 = require("../utils/constants");
const engagement_emitter_1 = require("../event-emitters/engagement.emitter");
const enums_1 = require("../utils/enums");
const engagement_registry_1 = require("../registry/engagement.registry");
let EngagementService = class EngagementService {
    constructor(dataSource, targetRepo, userEntity, options, engagementEmitter) {
        this.dataSource = dataSource;
        this.targetRepo = targetRepo;
        this.userEntity = userEntity;
        this.options = options;
        this.engagementEmitter = engagementEmitter;
    }
    get hasUserSupport() {
        return !!this.userEntity;
    }
    async ensureTarget(targetType, targetId) {
        let target = await this.targetRepo.findOne({
            where: { targetType, targetId },
        });
        if (target)
            return target;
        console.log('🚀 ~ file: engagement.service.ts:66 ~ EngagementService ~ ensureTarget ~ target', target);
        const registryEntry = Object.values(this.dataSource.entityMetadatas).find((meta) => meta.name.toLowerCase() === targetType.toLowerCase());
        if (!registryEntry) {
            throw new Error(`Unknown engageable type: ${targetType}`);
        }
        const entityRepo = this.dataSource.getRepository(registryEntry.target);
        const entity = await entityRepo.findOne({ where: { id: targetId } });
        if (!entity) {
            throw new common_1.NotFoundException(`${targetType} with ID '${targetId}' does not exist. Cannot create engagement target.`);
        }
        target = this.targetRepo.create({ targetType, targetId });
        await this.targetRepo.save(target);
        if ('engagementTarget' in entity) {
            entity.engagementTarget = target;
            await entityRepo.save(entity);
        }
        this.engagementEmitter.emit(enums_1.EngagementEvent.TARGET_CREATED, { target });
        return target;
    }
    async deleteTarget(targetType, targetId) {
        const target = await this.targetRepo.findOne({
            where: { targetType, targetId },
        });
        if (!target)
            throw new common_1.NotFoundException('Target not found');
        return this.targetRepo.remove(target);
    }
    async getTarget(targetType, targetId) {
        return this.targetRepo.findOne({
            where: { targetType, targetId },
            relations: ['likes', 'comments'],
        });
    }
    async getTargets() {
        const ROOT_TYPES = engagement_registry_1.EngagementRegistry.getRootList();
        const allEngagements = await this.targetRepo.find({
            where: {},
            relations: [
                'likes',
                'comments',
                'comments.likes',
                'comments.user',
                'actions',
            ],
            order: { createdAt: 'DESC' },
        });
        const rootTargets = allEngagements.filter((e) => ROOT_TYPES.includes(e.targetType));
        const internalTargets = allEngagements.filter((e) => !ROOT_TYPES.includes(e.targetType));
        const internalMap = new Map();
        for (const eng of internalTargets) {
            internalMap.set(`${eng.targetType}:${eng.targetId}`, eng);
        }
        for (const root of rootTargets) {
            for (const comment of root.comments) {
                const commentEngagement = internalMap.get(`comment:${comment.id}`);
                if (commentEngagement) {
                    comment.likes = commentEngagement.likes ?? [];
                    comment.replies = commentEngagement.comments ?? [];
                }
                else {
                    comment.likes = [];
                    comment.replies = [];
                }
            }
        }
        return rootTargets;
    }
    async deleteTargets() {
        const targets = await this.targetRepo.find();
        for (const target of targets) {
            const typeName = target.targetType.toLowerCase();
            if (engagement_registry_1.EngagementRegistry.isRegisteredByTypeName(typeName)) {
                const registeredEntity = engagement_registry_1.EngagementRegistry.get(typeName);
                if (registeredEntity) {
                    try {
                        const entityRepo = this.dataSource.getRepository(registeredEntity);
                        const entity = await entityRepo.findOne({
                            where: { id: target.targetId },
                        });
                        if (entity && 'engagementTarget' in entity) {
                            await this.dataSource
                                .createQueryBuilder()
                                .relation(registeredEntity, 'engagementTarget')
                                .of(entity)
                                .set(null);
                        }
                    }
                    catch (err) {
                        console.warn(`⚠️ Failed to unlink ${typeName} (${target.targetId}): ${err.message}`);
                    }
                }
            }
        }
        return this.targetRepo.delete({});
    }
};
exports.EngagementService = EngagementService;
exports.EngagementService = EngagementService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __param(1, (0, typeorm_1.InjectRepository)(engagement_target_entity_1.EngagementTarget)),
    __param(2, (0, common_1.Inject)(constants_1.UserEntityKey)),
    __param(3, (0, common_1.Inject)(constants_1.EngagementOptionsKey)),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        typeorm_2.Repository, Object, Object, engagement_emitter_1.EngagementEmitter])
], EngagementService);
//# sourceMappingURL=engagement.service.js.map