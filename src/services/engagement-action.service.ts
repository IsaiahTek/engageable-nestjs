// engagement-action.service.ts

import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { EngagementActionType } from '../interfaces/user_entity.type';
import { EngagementService } from './engagement.service';
import { DataSource, Repository } from 'typeorm';
import { EngagementAction } from '../entities/engagement-action.entity';
import { Inject, NotFoundException, Injectable } from '@nestjs/common';
// import { EngagementTarget } from '../entities/engagement-target.entity'; // REMOVED
import { EngagementEmitter } from '../event-emitters/engagement.emitter';
import { EngagementOptions } from '../interfaces/engagement-options.interface';
import { UserEntityKey, EngagementOptionsKey } from '../utils/constants';
import { EngagementEvent } from '../utils/enums';

@Injectable() // Added @Injectable() decorator which was missing
export class EngagementActionService extends EngagementService {
  constructor(
    @InjectDataSource() protected readonly dataSource: DataSource,
    // @InjectRepository(EngagementTarget) // REMOVED
    // protected targetRepo: Repository<EngagementTarget>, // REMOVED
    @Inject(UserEntityKey) protected readonly userEntity: any,
    @Inject(EngagementOptionsKey) protected options: EngagementOptions,
    protected readonly engagementEmitter: EngagementEmitter,
    @InjectRepository(EngagementAction)
    private readonly actionRepository: Repository<EngagementAction>,
  ) {
    // Corrected super() call to match the simplified EngagementService
    super(dataSource, userEntity, options, engagementEmitter);
  }

  async toggleAction(
    userId: string,
    targetType: string,
    targetId: string,
    type: EngagementActionType,
    metadata?: Record<string, any>,
  ) {
    // ⚠️ Target existence check (ensureTarget) is now the responsibility of the caller
    // or should be explicitly implemented here if required.

    // Query directly using the polymorphic columns
    const existing = await this.actionRepository.findOne({
      where: { userId, targetId, targetType, type },
    });

    if (existing) {
      // Toggle logic (for likes/bookmarks/reposts)
      await this.actionRepository.remove(existing);
      this.engagementEmitter.emit(EngagementEvent.ACTION_DELETED, {
        result: { id: existing.id }, // Provide some result info
        type,
      });
      return { removed: true };
    }

    const action = this.actionRepository.create({
      userId,
      targetType, // Use polymorphic type
      targetId,   // Use polymorphic ID
      type,
      // engagement: target, // REMOVED
      metadata,
    });

    const saved = await this.actionRepository.save(action);
    this.engagementEmitter.emit(EngagementEvent.ACTION_CREATED, {
      saved,
      type,
    });
    return { created: true, action: saved };
  }

  async getAllActions(action: EngagementActionType) {
    return this.actionRepository.find({
      relations: ['user'],
      where: { type: action },
      order: { createdAt: 'DESC' },
    });
  }

  async countActions(
    targetType: string,
    targetId: string,
    action: EngagementActionType,
  ) {
    return await this._countActions(targetType, targetId, action);
  }

  // DELETED: _toggleAction was a duplicate of toggleAction, but used old EngagementTarget logic.
  // It is redundant and removed.

  private async _countActions(
    targetType: string,
    targetId: string,
    action: EngagementActionType, // Action is mandatory here
  ) {
    // Query directly on the polymorphic columns
    return this.actionRepository.count({
      where: { 
        targetType, // Direct filter
        targetId,   // Direct filter
        type: action,
      },
      // relations: ['target'], // REMOVED: Target doesn't exist anymore
    });
  }
}


// import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
// import { EngagementActionType } from '../interfaces/user_entity.type';
// import { EngagementService } from './engagement.service';
// import { DataSource, Repository } from 'typeorm';
// import { EngagementAction } from '../entities/engagement-action.entity';
// import { Inject, NotFoundException } from '@nestjs/common';
// import { EngagementTarget } from '../entities/engagement-target.entity';
// import { EngagementEmitter } from '../event-emitters/engagement.emitter';
// import { EngagementOptions } from '../interfaces/engagement-options.interface';
// import { UserEntityKey, EngagementOptionsKey } from '../utils/constants';
// import { EngagementEvent } from '../utils/enums';

// export class EngagementActionService extends EngagementService {
//   constructor(
//     @InjectDataSource() protected readonly dataSource: DataSource,
//     @InjectRepository(EngagementTarget)
//     protected targetRepo: Repository<EngagementTarget>,
//     @Inject(UserEntityKey) protected readonly userEntity: any,
//     @Inject(EngagementOptionsKey) protected options: EngagementOptions,
//     protected readonly engagementEmitter: EngagementEmitter,
//     @InjectRepository(EngagementAction)
//     private readonly actionRepository: Repository<EngagementAction>,
//   ) {
//     super(dataSource, targetRepo, userEntity, options, engagementEmitter);
//   }
//   async toggleAction(
//     userId: string,
//     targetType: string,
//     targetId: string,
//     type: EngagementActionType,
//     metadata?: Record<string, any>,
//   ) {
//     const target = await super.ensureTarget(targetType, targetId);

//     const existing = await this.actionRepository.findOne({
//       where: { userId, targetId, targetType, type },
//     });

//     if (existing) {
//       // toggle logic (for likes/bookmarks)
//       await this.actionRepository.remove(existing);
//       return { removed: true };
//     }

//     const action = this.actionRepository.create({
//       userId,
//       targetType,
//       targetId,
//       type,
//       engagement: target,
//       metadata,
//     });

//     await this.actionRepository.save(action);
//     return { created: true, action };
//   }

//   async getAllActions(action: EngagementActionType) {
//     return this.actionRepository.find({
//       relations: ['user'],
//       where: { type: action },
//       order: { createdAt: 'DESC' },
//     });
//   }

//   async countActions(
//     targetType: string,
//     targetId: string,
//     action: EngagementActionType,
//   ) {
//     return await this._countActions(targetType, targetId, action);
//   }

//   public async _toggleAction(
//     user: any,
//     targetType: string,
//     targetId: string,
//     action: EngagementActionType,
//   ) {
//     const target = await this.targetRepo.findOne({
//       where: { targetType, targetId },
//     });
//     if (!target) throw new NotFoundException('Target not found');

//     const existing = await this.actionRepository.findOne({
//       where: { user, engagement: target },
//     });
//     if (existing) {
//       const result = await this.actionRepository.remove(existing);
//       this.engagementEmitter.emit(EngagementEvent.ACTION_DELETED, {
//         result,
//         action,
//       });
//       return result;
//     }

//     const like = this.actionRepository.create({
//       user,
//       engagement: target,
//       type: action,
//     });
//     const saved = await this.actionRepository.save(like);
//     this.engagementEmitter.emit(EngagementEvent.ACTION_CREATED, {
//       saved,
//       type: action,
//     });
//     return saved;
//   }

//   private async _countActions(
//     targetType: string,
//     targetId: string,
//     action?: EngagementActionType,
//   ) {
//     const target = await this.targetRepo.findOne({
//       where: { targetType, targetId },
//     });
//     if (!target) return 0;

//     const type = action;
//     return this.actionRepository.count({
//       where: { engagement: { id: target.id }, type },
//       relations: ['target'],
//     });
//   }
// }
