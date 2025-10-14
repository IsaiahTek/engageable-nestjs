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
// engagement.service.ts
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
        // Step 1: Check if engagement target already exists
        let target = await this.targetRepo.findOne({
            where: { targetType, targetId },
        });
        if (target)
            return target;
        console.log('🚀 ~ file: engagement.service.ts:66 ~ EngagementService ~ ensureTarget ~ target', target);
        // Step 2: Try to resolve the real entity type from metadata
        const registryEntry = Object.values(this.dataSource.entityMetadatas).find((meta) => meta.name.toLowerCase() === targetType.toLowerCase());
        if (!registryEntry) {
            throw new Error(`Unknown engageable type: ${targetType}`);
        }
        // Step 3: Confirm the actual entity exists
        const entityRepo = this.dataSource.getRepository(registryEntry.target);
        const entity = await entityRepo.findOne({ where: { id: targetId } });
        if (!entity) {
            throw new common_1.NotFoundException(`${targetType} with ID '${targetId}' does not exist. Cannot create engagement target.`);
        }
        // Step 4: Create the engagement target (since entity exists)
        target = this.targetRepo.create({ targetType, targetId });
        await this.targetRepo.save(target);
        // Step 5: Lazy link engagementTarget back to parent entity (if property exists)
        if ('engagementTarget' in entity) {
            entity.engagementTarget = target;
            await entityRepo.save(entity);
        }
        // Step 6: Emit target creation event (optional)
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
    // engagement.service.ts
    async getTargets() {
        var _a, _b;
        const ROOT_TYPES = engagement_registry_1.EngagementRegistry.getRootList();
        // Fetch all engagements
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
        // Separate root and internal engagements
        const rootTargets = allEngagements.filter((e) => ROOT_TYPES.includes(e.targetType));
        const internalTargets = allEngagements.filter((e) => !ROOT_TYPES.includes(e.targetType));
        // Create a quick lookup map for internal engagements by targetType+targetId
        const internalMap = new Map();
        for (const eng of internalTargets) {
            internalMap.set(`${eng.targetType}:${eng.targetId}`, eng);
        }
        // Attach nested engagement data to comments inside each root target
        for (const root of rootTargets) {
            for (const comment of root.comments) {
                const commentEngagement = internalMap.get(`comment:${comment.id}`);
                if (commentEngagement) {
                    comment.likes = (_a = commentEngagement.likes) !== null && _a !== void 0 ? _a : [];
                    comment.replies = (_b = commentEngagement.comments) !== null && _b !== void 0 ? _b : [];
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
            // Check if the targetType is registered in the engagement registry
            if (engagement_registry_1.EngagementRegistry.isRegisteredByTypeName(typeName)) {
                const registeredEntity = engagement_registry_1.EngagementRegistry.get(typeName);
                if (registeredEntity) {
                    try {
                        // Get the repository dynamically
                        const entityRepo = this.dataSource.getRepository(registeredEntity);
                        // Ensure the entity actually exists before unlinking
                        const entity = await entityRepo.findOne({
                            where: { id: target.targetId },
                        });
                        if (entity && 'engagementTarget' in entity) {
                            // Safely remove linkage to prevent cascading deletions
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
        // ✅ Now safely delete all engagement targets
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
