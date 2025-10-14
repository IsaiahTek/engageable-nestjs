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
exports.EngagementSubscriber = void 0;
// src/subscribers/engagement.subscriber.ts
const typeorm_1 = require("typeorm");
const common_1 = require("@nestjs/common");
const engagement_target_entity_1 = require("../entities/engagement-target.entity");
const constants_1 = require("../utils/constants");
const typeorm_2 = require("@nestjs/typeorm");
const engagement_registry_1 = require("../registry/engagement.registry");
const engagement_emitter_1 = require("../event-emitters/engagement.emitter");
const enums_1 = require("../utils/enums");
let EngagementSubscriber = class EngagementSubscriber {
    constructor(dataSource, options, engagementEmitter) {
        this.dataSource = dataSource;
        this.options = options;
        this.engagementEmitter = engagementEmitter;
        this.dataSource.subscribers.push(this);
    }
    async afterInsert(event) {
        // // Skip if autoCreateTargets is disabled
        // if (!this.options.autoCreateTargets) return;
        // const metadata = Reflect.getMetadata(
        //   ENGAGEABLE_METADATA_KEY,
        //   event.metadata.target,
        // );
        // if (!metadata) return; // entity is not @Engageable
        // const targetRepo = event.manager.getRepository(EngagementTarget);
        // const exists = await targetRepo.findOne({
        //   where: { targetType: metadata, targetId: event.entity.id },
        // });
        // if (!exists) {
        //   const newTarget = targetRepo.create({
        //     targetType: metadata,
        //     targetId: event.entity.id,
        //   });
        //   await targetRepo.save(newTarget);
        // }
        const targetType = engagement_registry_1.EngagementRegistry.get(event.metadata.targetName);
        if (!targetType)
            return; // Not an engageable entity
        const targetRepo = event.manager.getRepository(engagement_target_entity_1.EngagementTarget);
        let target = await targetRepo.findOne({
            where: { targetType, targetId: event.entity.id },
        });
        if (!target && this.options.autoCreateTargets) {
            target = targetRepo.create({ targetType, targetId: event.entity.id });
            await targetRepo.save(target);
            // Link back to entity
            if ('engagementTarget' in event.entity) {
                event.entity.engagementTarget = target;
                await event.manager.save(event.entity);
                this.engagementEmitter.emit(enums_1.EngagementEvent.TARGET_CREATED, target);
            }
        }
    }
};
exports.EngagementSubscriber = EngagementSubscriber;
exports.EngagementSubscriber = EngagementSubscriber = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectDataSource)()),
    __param(1, (0, common_1.Inject)(constants_1.EngagementOptionsKey)),
    __metadata("design:paramtypes", [typeorm_1.DataSource, Object, engagement_emitter_1.EngagementEmitter])
], EngagementSubscriber);
