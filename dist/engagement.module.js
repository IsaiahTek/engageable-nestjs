"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var EngagementModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngagementModule = void 0;
// src/engagement.module.ts
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const engagement_service_1 = require("./service/engagement.service");
const comment_service_1 = require("./service/comment.service");
const engagement_target_entity_1 = require("./entities/engagement-target.entity");
const comment_entity_1 = require("./entities/comment.entity");
const engagement_controller_1 = require("./controller/engagement.controller");
const engagement_registry_1 = require("./registry/engagement.registry");
const engagement_subscriber_1 = require("./subscribers/engagement.subscriber");
const constants_1 = require("./utils/constants");
const event_emitter_1 = require("@nestjs/event-emitter");
const engagement_emitter_1 = require("./event-emitters/engagement.emitter");
const register_user_relation_1 = require("./utils/register-user-relation");
const engagement_action_service_1 = require("./service/engagement-action.service");
const engagement_action_entity_1 = require("./entities/engagement-action.entity");
const like_entity_1 = require("./entities/like.entity");
const like_service_1 = require("./service/like.service");
const default_auth_guard_1 = require("./default-auth-guard");
let EngagementModule = EngagementModule_1 = class EngagementModule {
    static register(options) {
        var _a, _b, _c, _d, _e, _f, _g;
        const imports = [
            typeorm_1.TypeOrmModule.forFeature([
                engagement_target_entity_1.EngagementTarget,
                engagement_action_entity_1.EngagementAction,
                comment_entity_1.Comment,
                like_entity_1.Like,
            ]),
            event_emitter_1.EventEmitterModule.forRoot(),
        ];
        if (options === null || options === void 0 ? void 0 : options.userEntity) {
            imports.push(typeorm_1.TypeOrmModule.forFeature([options.userEntity]));
            (0, register_user_relation_1.registerUserRelation)(options.userEntity);
        }
        if (options === null || options === void 0 ? void 0 : options.engageableEntities) {
            options.engageableEntities.forEach((entity) => {
                engagement_registry_1.EngagementRegistry.register(entity);
            });
        }
        return {
            module: EngagementModule_1,
            imports,
            providers: [
                engagement_service_1.EngagementService,
                engagement_action_service_1.EngagementActionService,
                comment_service_1.CommentService,
                like_service_1.LikeService,
                engagement_subscriber_1.EngagementSubscriber,
                engagement_emitter_1.EngagementEmitter,
                {
                    provide: constants_1.EngagementOptionsKey,
                    useValue: {
                        autoCreateTargets: (_a = options === null || options === void 0 ? void 0 : options.autoCreateTargets) !== null && _a !== void 0 ? _a : true,
                        lazyLinking: (_b = options === null || options === void 0 ? void 0 : options.lazyLinking) !== null && _b !== void 0 ? _b : true,
                        emitEvents: (_c = options === null || options === void 0 ? void 0 : options.emitEvents) !== null && _c !== void 0 ? _c : true,
                        userEntity: (_d = options === null || options === void 0 ? void 0 : options.userEntity) !== null && _d !== void 0 ? _d : null,
                        allowAnonymous: (_e = options === null || options === void 0 ? void 0 : options.allowAnonymous) !== null && _e !== void 0 ? _e : false,
                    },
                },
                {
                    provide: constants_1.UserEntityKey,
                    useValue: (_f = options === null || options === void 0 ? void 0 : options.userEntity) !== null && _f !== void 0 ? _f : null,
                },
                {
                    provide: constants_1.AUTH_GUARD_KEY,
                    useClass: (_g = options === null || options === void 0 ? void 0 : options.authGuard) !== null && _g !== void 0 ? _g : default_auth_guard_1.DefaultEngagementAuthGuard,
                },
            ],
            controllers: [engagement_controller_1.EngagementController],
            exports: [engagement_service_1.EngagementService],
        };
    }
};
exports.EngagementModule = EngagementModule;
exports.EngagementModule = EngagementModule = EngagementModule_1 = __decorate([
    (0, common_1.Module)({})
], EngagementModule);
