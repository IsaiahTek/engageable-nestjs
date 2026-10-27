// like.service.ts

import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Like } from '../entities/like.entity';
import { EngagementEvent } from '../utils/enums';
import { EngagementService } from './engagement.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
// import { EngagementTarget } from '../entities/engagement-target.entity'; // REMOVED
import { EngagementEmitter } from '../event-emitters/engagement.emitter';
import { EngagementOptions } from '../interfaces/engagement-options.interface';
import { UserEntityKey, EngagementOptionsKey } from '../utils/constants';

@Injectable()
export class LikeService extends EngagementService {
  constructor(
    @InjectDataSource() protected readonly dataSource: DataSource,
    // @InjectRepository(EngagementTarget) // REMOVED
    // protected targetRepo: Repository<EngagementTarget>, // REMOVED
    @Inject(UserEntityKey) protected readonly userEntity: any,
    @Inject(EngagementOptionsKey) protected options: EngagementOptions,
    protected readonly engagementEmitter: EngagementEmitter,
    @InjectRepository(Like)
    protected likeRepo: Repository<Like>,
  ) {
    // Corrected super() call to match the simplified EngagementService
    super(dataSource, userEntity, options, engagementEmitter);
  }

  async getAllLikes(pagination?: { page?: number; limit?: number }) {
    const page = Math.max(pagination?.page || 1, 1);
    const limit = Math.max(pagination?.limit || 20, 1);
    const skip = (page - 1) * limit;

    const [data, total] = await this.likeRepo.findAndCount({
      relations: ['user'],
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

  async toggleLike(userId: any, targetType: string, targetId: string) {
    if (this.hasUserSupport && !this.options.allowAnonymous) {
      if (!userId) {
        throw new ForbiddenException('Authentication required to like');
      }

      const userRepo = this.dataSource.getRepository(this.userEntity);
      const user = await userRepo.findOne({ where: { id: userId } });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return await this._toggleLike(user, targetType, targetId);
    } else {
      return await this._toggleLike(null, targetType, targetId);
    }
  }

  async countLikes(targetType: string, targetId: string) {
    return await this._countLikes(targetType, targetId);
  }

  public async _toggleLike(user: any, targetType: string, targetId: string) {
    const existing = await this.likeRepo.findOne({
      where: { 
        userId: user ? user.id : null,
        targetType,
        targetId,
      },
    });

    if (existing) {
      const result = await this.likeRepo.remove(existing);
      this.engagementEmitter.emit(EngagementEvent.LIKE_DELETED, {
        like: result,
      });
      return { liked: false, removed: result };
    }

    const isComment = targetType.toLowerCase() === 'comment';
    const like = this.likeRepo.create({
      user,
      targetId,
      targetType,
      commentId: isComment ? targetId : undefined,
    });
    
    const saved = await this.likeRepo.save(like);
    this.engagementEmitter.emit(EngagementEvent.LIKE_CREATED, { like: saved });
    return { liked: true, like: saved };
  }

  private async _countLikes(targetType: string, targetId: string) {
    return this.likeRepo.count({
      where: { 
        targetType, 
        targetId 
      },
    });
  }
}

