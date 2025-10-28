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
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const engagement_service_1 = require("./services/engagement.service");
const comment_service_1 = require("./services/comment.service");
const comment_entity_1 = require("./entities/comment.entity");
const engagement_controller_1 = require("./controller/engagement.controller");
const engagement_registry_1 = require("./registry/engagement.registry");
const constants_1 = require("./utils/constants");
const event_emitter_1 = require("@nestjs/event-emitter");
const engagement_emitter_1 = require("./event-emitters/engagement.emitter");
const register_user_relation_1 = require("./utils/register-user-relation");
const engagement_action_service_1 = require("./services/engagement-action.service");
const engagement_action_entity_1 = require("./entities/engagement-action.entity");
const like_entity_1 = require("./entities/like.entity");
const like_service_1 = require("./services/like.service");
const default_auth_guard_1 = require("./default-auth-guard");
const review_entity_1 = require("./entities/review.entity");
const review_service_1 = require("./services/review.service");
let EngagementModule = EngagementModule_1 = class EngagementModule {
    static register(options) {
        const imports = [
            typeorm_1.TypeOrmModule.forFeature([
                engagement_action_entity_1.EngagementAction,
                comment_entity_1.Comment,
                like_entity_1.Like,
                review_entity_1.Review,
            ]),
            event_emitter_1.EventEmitterModule.forRoot(),
        ];
        if (options?.userEntity) {
            imports.push(typeorm_1.TypeOrmModule.forFeature([options.userEntity]));
            (0, register_user_relation_1.registerUserRelation)(options.userEntity);
        }
        if (options?.engageableEntities) {
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
                review_service_1.ReviewService,
                engagement_emitter_1.EngagementEmitter,
                {
                    provide: constants_1.EngagementOptionsKey,
                    useValue: {
                        autoCreateTargets: options?.autoCreateTargets ?? true,
                        lazyLinking: options?.lazyLinking ?? true,
                        emitEvents: options?.emitEvents ?? true,
                        userEntity: options?.userEntity ?? null,
                        allowAnonymous: options?.allowAnonymous ?? false,
                    },
                },
                {
                    provide: constants_1.UserEntityKey,
                    useValue: options?.userEntity ?? null,
                },
                {
                    provide: constants_1.AUTH_GUARD_KEY,
                    useClass: options?.authGuard ?? default_auth_guard_1.DefaultEngagementAuthGuard,
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
//# sourceMappingURL=engagement.module.js.map