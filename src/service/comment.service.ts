import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Comment } from '../entities/comment.entity';
// import { EngagementUser as User } from '../entities/base/engagement-user.entity';
import { DataSource, Repository } from 'typeorm';
import { EngagementEmitter } from '../event-emitters/engagement.emitter';
import { EngagementService } from './engagement.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { EngagementEvent } from '../utils/enums';
import { EngagementTarget } from '../entities/engagement-target.entity';
import { EngagementOptions } from '../interfaces/engagement-options.interface';
import { UserEntityKey, EngagementOptionsKey } from '../utils/constants';

@Injectable()
export class CommentService extends EngagementService {
  constructor(
    @InjectDataSource() protected readonly dataSource: DataSource,
    @InjectRepository(EngagementTarget)
    protected targetRepo: Repository<EngagementTarget>,
    @Inject(UserEntityKey) protected readonly userEntity: any,
    @Inject(EngagementOptionsKey) protected options: EngagementOptions,
    protected readonly engagementEmitter: EngagementEmitter,
    @InjectRepository(Comment)
    protected commentRepo: Repository<Comment>,
  ) {
    super(dataSource, targetRepo, userEntity, options, engagementEmitter);
  }

  async addComment(
    user: any,
    targetType: string,
    targetId: string,
    content: string,
  ) {
    const target = await this.ensureTarget(targetType, targetId);
    return await this._addComment({
      user,
      targetType: target.targetType,
      targetId: target.targetId,
      content,
    });
  }

  async getComments(targetType: string, targetId: string) {
    return this._getComments(targetType, targetId);
  }

  async removeComment(commentId: string) {
    return await this._removeComment(commentId);
  }

  async updateComment(commentId: string, content: string) {
    return await this._updateComment(commentId, content);
  }

  // Helper to recursively fetch replies
  public async getCommentReplies(commentId: string): Promise<Comment[]> {
    // 1️⃣ Fetch replies to the current comment
    const replies = await this.commentRepo.find({
      where: { parent: { id: commentId } },
      relations: ['user', 'likes'],
      order: { createdAt: 'DESC' },
    });

    // 2️⃣ Recursively fetch deeper replies (threaded comments)
    for (const reply of replies) {
      reply.replies = await this.getCommentReplies(reply.id);
    }

    return replies;
  }

  async getAllComments() {
    return this.commentRepo.find({
      relations: ['user', 'likes', 'replies', 'replies.user', 'replies.likes'],
      order: { createdAt: 'DESC' },
    });
  }

  private async buildCommentTree(comment: Comment) {
    const replies = await this.commentRepo.find({
      where: { parent: comment },
      relations: ['user', 'likes'],
    });
    return {
      ...comment,
      replies: await Promise.all(replies.map((c) => this.buildCommentTree(c))),
    };
  }

  private async _addComment({
    user,
    targetType,
    targetId,
    content,
  }: {
    user: any;
    targetType: string;
    targetId: string;
    content: string;
  }) {
    const target = await super.getTarget(targetType, targetId);
    if (!target) throw new NotFoundException('Target not found');

    const comment = this.commentRepo.create({
      user,
      engagement: target,
      targetId: target.id,
      targetType: targetType,
      content,
    });
    return this.commentRepo.save(comment);
  }

  private async _getComments(targetType: string, targetId: string) {
    const target = await super.targetRepo.findOne({
      where: { targetType, targetId },
      relations: ['comments'],
    });
    if (!target) throw new NotFoundException('Target not found');

    // Get comments for this target, including their users, likes, and replies
    return this.commentRepo.find({
      where: { engagement: target },
      relations: [
        'user',
        'likes',
        'likes.user',
        'replies',
        'replies.user',
        'replies.likes',
        'replies.likes.user',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  private async _updateComment(commentId: string, content: string) {
    const comment = await this.commentRepo.findOne({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundException('Comment not found');
    comment.content = content;
    return this.commentRepo.save(comment);
  }

  private async _removeComment(commentId: string) {
    const comment = await this.commentRepo.findOne({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundException('Comment not found');
    const result = this.commentRepo.remove(comment);
    super.engagementEmitter.emit(EngagementEvent.COMMENT_DELETED, { result });
  }
}
