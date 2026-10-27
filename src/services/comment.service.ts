import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Comment } from '../entities/comment.entity';
import { DataSource, Repository } from 'typeorm';
import { EngagementEmitter } from '../event-emitters/engagement.emitter';
import { EngagementService } from './engagement.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { EngagementEvent } from '../utils/enums';
// import { EngagementTarget } from '../entities/engagement-target.entity'; // REMOVED
import { EngagementOptions } from '../interfaces/engagement-options.interface';
import { UserEntityKey, EngagementOptionsKey } from '../utils/constants';

@Injectable()
export class CommentService extends EngagementService { // Assuming base EngagementService is also updated/simplified
  constructor(
    @InjectDataSource() protected readonly dataSource: DataSource,
    // @InjectRepository(EngagementTarget) // REMOVED targetRepo
    // protected targetRepo: Repository<EngagementTarget>, // REMOVED targetRepo
    @Inject(UserEntityKey) protected readonly userEntity: any,
    @Inject(EngagementOptionsKey) protected options: EngagementOptions,
    protected readonly engagementEmitter: EngagementEmitter,
    @InjectRepository(Comment)
    protected commentRepo: Repository<Comment>,
  ) {
    // Pass only the necessary arguments to the base class
    super(
      dataSource,
      // targetRepo, // REMOVED targetRepo argument
      userEntity,
      options,
      engagementEmitter
    );
  }

  // NOTE: ensureTarget and getTarget methods must be simplified/removed in the base class (EngagementService)
  // as they previously relied on EngagementTarget. They should now just validate target existence if necessary.

  async addComment(
    userId: any,
    targetType: string,
    targetId: string,
    content: string,
    parentId?: string, // Added optional parentId for replies
  ) {
    // 1. Authentication/User Check
    if (this.hasUserSupport && !this.options.allowAnonymous) {
      if (!userId) {
        throw new ForbiddenException('Authentication required to comment');
      }

      const userRepo = this.dataSource.getRepository(this.userEntity);
      const user = await userRepo.findOne({ where: { id: userId } });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return await this._addComment({
        user,
        targetType: targetType, // Use passed targetType directly
        targetId: targetId,     // Use passed targetId directly
        content,
        parentId,
      });
    } else {
      // Anonymous engagement
      return await this._addComment({
        user: null,
        targetType: targetType, // Use passed targetType directly
        targetId: targetId,     // Use passed targetId directly
        content,
        parentId,
      });
    }
  }

  async getComments(targetType: string, targetId: string) {
    return this._getComments(targetType, targetId);
  }

  async removeComment(commentId: string, userId?: string) {
    return await this._removeComment(commentId, userId);
  }

  async updateComment(commentId: string, content: string, userId?: string) {
    return await this._updateComment(commentId, content, userId);
  }

  public async getCommentReplies(commentId: string): Promise<Comment[]> {
    const replies = await this.commentRepo.find({
      where: { parent: { id: commentId } },
      relations: ['user', 'likes'],
      order: { createdAt: 'DESC' },
    });

    for (const reply of replies) {
      reply.replies = await this.getCommentReplies(reply.id);
    }

    return replies;
  }

  async getAllComments(pagination?: { page?: number; limit?: number }) {
    const page = Math.max(pagination?.page || 1, 1);
    const limit = Math.max(pagination?.limit || 20, 1);
    const skip = (page - 1) * limit;

    const [data, total] = await this.commentRepo.findAndCount({
      relations: ['user', 'likes', 'replies', 'replies.user', 'replies.likes'],
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

  // --- CORE LOGIC MODIFICATIONS ---

  private async _addComment({
    user,
    targetType,
    targetId,
    content,
    parentId,
  }: {
    user: any;
    targetType: string;
    targetId: string;
    content: string;
    parentId?: string;
  }) {
    let parentComment: Comment | undefined;
    if (parentId) {
      parentComment = await this.commentRepo.findOne({ where: { id: parentId } });
      if (!parentComment) throw new NotFoundException('Parent comment not found');
    }

    const comment = this.commentRepo.create({
      user,
      targetId,
      targetType,
      content,
      parent: parentComment,
    });

    const saved = await this.commentRepo.save(comment);

    this.engagementEmitter.emit(EngagementEvent.COMMENT_CREATED, {
      comment: saved,
    });
    return saved;
  }

  private async _getComments(targetType: string, targetId: string) {
    const comments = await this.commentRepo.find({
      where: { 
        targetType, 
        targetId,
      },
      relations: [
        'user',
        'likes',
        'likes.user',
        'parent',
      ],
      order: { createdAt: 'ASC' },
    });

    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    for (const comment of comments) {
      comment.replies = [];
      commentMap.set(comment.id, comment);
    }

    for (const comment of comments) {
      if (comment.parent?.id && commentMap.has(comment.parent.id)) {
        commentMap.get(comment.parent.id)!.replies.push(comment);
      } else if (!comment.parent) {
        rootComments.push(comment);
      }
    }

    return rootComments.reverse();
  }

  private async _updateComment(commentId: string, content: string, userId?: string) {
    const comment = await this.commentRepo.findOne({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundException('Comment not found');

    if (userId && comment.userId && comment.userId !== userId) {
      throw new ForbiddenException('You can only update your own comments');
    }

    comment.content = content;
    return this.commentRepo.save(comment);
  }

  private async _removeComment(commentId: string, userId?: string) {
    const comment = await this.commentRepo.findOne({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundException('Comment not found');

    if (userId && comment.userId && comment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    const result = await this.commentRepo.remove(comment);
    this.engagementEmitter.emit(EngagementEvent.COMMENT_DELETED, { result });
    return result;
  }
}

