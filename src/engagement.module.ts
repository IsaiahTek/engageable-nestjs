// src/engagement.module.ts
import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EngagementService } from './service/engagement.service';
import { CommentService } from './service/comment.service';
import { EngagementTarget } from './entities/engagement-target.entity';
import { Comment } from './entities/comment.entity';
import { EngagementController } from './controller/engagement.controller';
import { EngagementRegistry } from './registry/engagement.registry';
import { EngagementSubscriber } from './subscribers/engagement.subscriber';
import {
  AUTH_GUARD_KEY,
  EngagementOptionsKey,
  UserEntityKey,
} from './utils/constants';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { EngagementOptions } from './interfaces/engagement-options.interface';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EngagementEmitter } from './event-emitters/engagement.emitter';
import { registerUserRelation } from './utils/register-user-relation';
import { EngagementActionService } from './service/engagement-action.service';
import { EngagementAction } from './entities/engagement-action.entity';
import { Like } from './entities/like.entity';
import { LikeService } from './service/like.service';
import { DefaultEngagementAuthGuard } from './default-auth-guard';

@Module({})
export class EngagementModule {
  static register(options?: EngagementOptions): DynamicModule {
    const imports = [
      TypeOrmModule.forFeature([
        EngagementTarget,
        EngagementAction,
        Comment,
        Like,
      ]),
      EventEmitterModule.forRoot(),
    ];

    if (options?.userEntity) {
      imports.push(
        TypeOrmModule.forFeature([options.userEntity as EntityClassOrSchema]),
      );
      registerUserRelation(options.userEntity);
    }

    if (options?.engageableEntities) {
      options.engageableEntities.forEach((entity) => {
        EngagementRegistry.register(entity);
      });
    }

    return {
      module: EngagementModule,
      imports,
      providers: [
        EngagementService,
        EngagementActionService,
        CommentService,
        LikeService,
        EngagementSubscriber,
        EngagementEmitter,
        {
          provide: EngagementOptionsKey,
          useValue: {
            autoCreateTargets: options?.autoCreateTargets ?? true,
            lazyLinking: options?.lazyLinking ?? true,
            emitEvents: options?.emitEvents ?? true,
            userEntity: options?.userEntity ?? null,
            allowAnonymous: options?.allowAnonymous ?? false,
          },
        },
        {
          provide: UserEntityKey,
          useValue: options?.userEntity ?? null,
        },
        {
          provide: AUTH_GUARD_KEY,
          useClass: options?.authGuard ?? DefaultEngagementAuthGuard,
        },
      ],
      controllers: [EngagementController],
      exports: [EngagementService],
    };
  }
}
