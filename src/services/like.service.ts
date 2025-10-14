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
import { EngagementTarget } from '../entities/engagement-target.entity';
import { EngagementEmitter } from '../event-emitters/engagement.emitter';
import { EngagementOptions } from '../interfaces/engagement-options.interface';
import { UserEntityKey, EngagementOptionsKey } from '../utils/constants';

@Injectable()
export class LikeService extends EngagementService {
  constructor(
    @InjectDataSource() protected readonly dataSource: DataSource,
    @InjectRepository(EngagementTarget)
    protected targetRepo: Repository<EngagementTarget>,
    @Inject(UserEntityKey) protected readonly userEntity: any,
    @Inject(EngagementOptionsKey) protected options: EngagementOptions,
    protected readonly engagementEmitter: EngagementEmitter,
    @InjectRepository(Like)
    protected likeRepo: Repository<Like>,
  ) {
    super(dataSource, targetRepo, userEntity, options, engagementEmitter);
  }

  async getAllLikes() {
    return this.likeRepo.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async toggleLike(userId: any, targetType: string, targetId: string) {
    console.log('toggleLike: ', userId, targetType, targetId);
    const target = await this.ensureTarget(targetType, targetId);

    if (this.hasUserSupport && !this.options.allowAnonymous) {
      if (!userId) {
        throw new ForbiddenException('Authentication required to like');
      }

      const userRepo = this.dataSource.getRepository(this.userEntity);
      const user = await userRepo.findOne({ where: { id: userId } });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return await this._toggleLike(user, target.targetType, target.targetId);
    } else {
      // Anonymous engagement
      return await this._toggleLike(null, target.targetType, target.targetId);
    }
  }

  async countLikes(targetType: string, targetId: string) {
    return await this._countLikes(targetType, targetId);
  }

  public async _toggleLike(user: any, targetType: string, targetId: string) {
    const target = await this.targetRepo.findOne({
      where: { targetType, targetId },
    });
    if (!target) throw new NotFoundException('Target not found');

    const existing = await this.likeRepo.findOne({
      where: { user, engagement: target },
    });
    if (existing) {
      const result = await this.likeRepo.remove(existing);
      this.engagementEmitter.emit(EngagementEvent.LIKE_DELETED, {
        like: result,
      });
      return result;
    }

    const like = this.likeRepo.create({
      user,
      engagement: target,
      targetId: target.id,
      targetType: targetType,
    });
    const saved = await this.likeRepo.save(like);
    this.engagementEmitter.emit(EngagementEvent.LIKE_CREATED, { like: saved });
    return saved;
  }

  private async _countLikes(targetType: string, targetId: string) {
    const target = await this.targetRepo.findOne({
      where: { targetType, targetId },
    });
    console.log('Likes count for:', targetType, targetId, target);
    if (!target) return 0;

    return this.likeRepo.count({
      where: { engagement: { id: target.id } },
      relations: ['engagement'],
    });
  }
}
