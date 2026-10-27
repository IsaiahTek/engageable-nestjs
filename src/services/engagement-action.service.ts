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

  async getAllActions(action: EngagementActionType, pagination?: { page?: number; limit?: number }) {
    const page = Math.max(pagination?.page || 1, 1);
    const limit = Math.max(pagination?.limit || 20, 1);
    const skip = (page - 1) * limit;

    const [data, total] = await this.actionRepository.findAndCount({
      relations: ['user'],
      where: { type: action },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async countActions(
    targetType: string,
    targetId: string,
    action: EngagementActionType,
  ) {
    return await this._countActions(targetType, targetId, action);
  }

  private async _countActions(
    targetType: string,
    targetId: string,
    action: EngagementActionType,
  ) {
    return this.actionRepository.count({
      where: { 
        targetType,
        targetId,
        type: action,
      },
    });
  }
}

