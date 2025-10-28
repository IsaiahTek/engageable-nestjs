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

  async removeComment(commentId: string) {
    return await this._removeComment(commentId);
  }

  async updateComment(commentId: string, content: string) {
    return await this._updateComment(commentId, content);
  }

  // Helper to recursively fetch replies (1️⃣ is now correct)
  public async getCommentReplies(commentId: string): Promise<Comment[]> {
    // Fetch replies to the current comment
    const replies = await this.commentRepo.find({
      // We query on the parent column directly
      where: { parent: { id: commentId } },
      relations: ['user', 'likes'],
      order: { createdAt: 'DESC' },
    });

    // Recursively fetch deeper replies (threaded comments)
    for (const reply of replies) {
      // NOTE: This assumes you added 'replies: Comment[]' to the Comment entity
      reply.replies = await this.getCommentReplies(reply.id);
    }

    return replies;
  }

  async getAllComments() {
    // This is generally inefficient for a large system, but maintained for consistency
    return this.commentRepo.find({
      relations: ['user', 'likes', 'replies', 'replies.user', 'replies.likes'],
      order: { createdAt: 'DESC' },
    });
  }

  // The buildCommentTree method logic is often simplified by the getCommentReplies structure
  // but keeping it as a separate utility for now:
  private async buildCommentTree(comment: Comment): Promise<Comment> {
    const replies = await this.commentRepo.find({
      where: { parent: { id: comment.id } }, // Fixed to use the parent ID
      relations: ['user', 'likes'],
    });
    // This recursive structure can lead to deep nesting issues, but it's kept as per your original intent.
    return {
      ...comment,
      replies: await Promise.all(replies.map((c) => this.buildCommentTree(c))),
    } as Comment; // Explicitly cast the result back to Comment type
  }

  // --- CORE LOGIC MODIFICATIONS ---

  private async _addComment({
    user,
    targetType,
    targetId,
    content,
    parentId, // New: for replying to a specific comment
  }: {
    user: any;
    targetType: string;
    targetId: string;
    content: string;
    parentId?: string;
  }) {
    // ⚠️ Target validation: If you still need to ensure the target entity (e.g., Fundraiser) exists, 
    // you must now implement a specific check here (e.g., calling a FundraiserService).
    // For now, we assume the targetType and targetId are valid strings.

    let parentComment: Comment | undefined;
    if (parentId) {
      parentComment = await this.commentRepo.findOne({ where: { id: parentId } });
      if (!parentComment) throw new NotFoundException('Parent comment not found');
    }

    const comment = this.commentRepo.create({
      user,
      targetId: targetId,      // Directly use polymorphic ID
      targetType: targetType,  // Directly use polymorphic Type
      content,
      parent: parentComment,   // Set parent comment if replying
      // engagement: target, // REMOVED
      // targetId: target.id,  // REMOVED (already set above)
    });

    this.engagementEmitter.emit(EngagementEvent.COMMENT_CREATED, {
      comment,
    })
    return this.commentRepo.save(comment);
  }

  private async _getComments(targetType: string, targetId: string) {
    // Query directly on the polymorphic columns, filtering for root comments (parent is null)
    const rootComments = await this.commentRepo.find({
      where: { 
        targetType, 
        targetId,
        parent: null, // Only fetch top-level comments for the target
      },
      relations: [
        'user',
        'likes',
        'likes.user',
      ],
      order: { createdAt: 'DESC' },
    });
    
    // Build the full comment tree recursively for each root comment
    return Promise.all(rootComments.map(comment => this.buildCommentTree(comment)));

    /* // ORIGINAL CODE (Commented out):
    const target = await super.targetRepo.findOne({
      where: { targetType, targetId },
      relations: ['comments'],
    });
    if (!target) throw new NotFoundException('Target not found');

    return this.commentRepo.find({
      where: { engagement: target },
      // ... relations
    });
    */
  }

  // ... (Other methods like _updateComment and _removeComment remain mostly unchanged)

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
    return result; // Return result consistently
  }
}








// import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
// import { Comment } from '../entities/comment.entity';
// // import { EngagementUser as User } from '../entities/base/engagement-user.entity';
// import { DataSource, Repository } from 'typeorm';
// import { EngagementEmitter } from '../event-emitters/engagement.emitter';
// import { EngagementService } from './engagement.service';
// import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
// import { EngagementEvent } from '../utils/enums';
// // import { EngagementTarget } from '../entities/engagement-target.entity';
// import { EngagementOptions } from '../interfaces/engagement-options.interface';
// import { UserEntityKey, EngagementOptionsKey } from '../utils/constants';

// @Injectable()
// export class CommentService extends EngagementService {
//   constructor(
//     @InjectDataSource() protected readonly dataSource: DataSource,
//     // @InjectRepository(EngagementTarget)
//     // protected targetRepo: Repository<EngagementTarget>,
//     @Inject(UserEntityKey) protected readonly userEntity: any,
//     @Inject(EngagementOptionsKey) protected options: EngagementOptions,
//     protected readonly engagementEmitter: EngagementEmitter,
//     @InjectRepository(Comment)
//     protected commentRepo: Repository<Comment>,
//   ) {
//     super(
//       dataSource,
//       // targetRepo,
//       userEntity,
//       options,
//       engagementEmitter
//     );
//   }

//   async addComment(
//     userId: any,
//     targetType: string,
//     targetId: string,
//     content: string,
//   ) {
//     const target = await this.ensureTarget(targetType, targetId);
//     if (this.hasUserSupport && !this.options.allowAnonymous) {
//       if (!userId) {
//         throw new ForbiddenException('Authentication required to like');
//       }

//       const userRepo = this.dataSource.getRepository(this.userEntity);
//       const user = await userRepo.findOne({ where: { id: userId } });

//       if (!user) {
//         throw new NotFoundException('User not found');
//       }

//       return await this._addComment({
//         user,
//         targetType: target.targetType,
//         targetId: target.targetId,
//         content,
//       });;
//     } else {
//       // Anonymous engagement
//       return await this._addComment({
//         user: null,
//         targetType: target.targetType,
//         targetId: target.targetId,
//         content,
//       });
//     }
//   }

//   async getComments(targetType: string, targetId: string) {
//     return this._getComments(targetType, targetId);
//   }

//   async removeComment(commentId: string) {
//     return await this._removeComment(commentId);
//   }

//   async updateComment(commentId: string, content: string) {
//     return await this._updateComment(commentId, content);
//   }

//   // Helper to recursively fetch replies
//   public async getCommentReplies(commentId: string): Promise<Comment[]> {
//     // 1️⃣ Fetch replies to the current comment
//     const replies = await this.commentRepo.find({
//       where: { parent: { id: commentId } },
//       relations: ['user', 'likes'],
//       order: { createdAt: 'DESC' },
//     });

//     // 2️⃣ Recursively fetch deeper replies (threaded comments)
//     for (const reply of replies) {
//       reply.replies = await this.getCommentReplies(reply.id);
//     }

//     return replies;
//   }

//   async getAllComments() {
//     return this.commentRepo.find({
//       relations: ['user', 'likes', 'replies', 'replies.user', 'replies.likes'],
//       order: { createdAt: 'DESC' },
//     });
//   }

//   private async buildCommentTree(comment: Comment): Promise<Comment> {
//     const replies = await this.commentRepo.find({
//       where: { parent: comment },
//       relations: ['user', 'likes'],
//     });
//     return {
//       ...comment,
//       replies: await Promise.all(replies.map((c) => this.buildCommentTree(c))),
//     };
//   }

//   private async _addComment({
//     user,
//     targetType,
//     targetId,
//     content,
//   }: {
//     user: any;
//     targetType: string;
//     targetId: string;
//     content: string;
//   }) {
//     const target = await super.getTarget(targetType, targetId);
//     if (!target) throw new NotFoundException('Target not found');

//     const comment = this.commentRepo.create({
//       user,
//       engagement: target,
//       targetId: target.id,
//       targetType: targetType,
//       content,
//     });
//     this.engagementEmitter.emit(EngagementEvent.COMMENT_CREATED, {
//       comment,
//     })
//     return this.commentRepo.save(comment);
//   }

//   private async _getComments(targetType: string, targetId: string) {
//     const target = await super.targetRepo.findOne({
//       where: { targetType, targetId },
//       relations: ['comments'],
//     });
//     if (!target) throw new NotFoundException('Target not found');

//     // Get comments for this target, including their users, likes, and replies
//     return this.commentRepo.find({
//       where: { engagement: target },
//       relations: [
//         'user',
//         'likes',
//         'likes.user',
//         'replies',
//         'replies.user',
//         'replies.likes',
//         'replies.likes.user',
//       ],
//       order: { createdAt: 'DESC' },
//     });
//   }

//   private async _updateComment(commentId: string, content: string) {
//     const comment = await this.commentRepo.findOne({
//       where: { id: commentId },
//     });
//     if (!comment) throw new NotFoundException('Comment not found');
//     comment.content = content;
//     return this.commentRepo.save(comment);
//   }

//   private async _removeComment(commentId: string) {
//     const comment = await this.commentRepo.findOne({
//       where: { id: commentId },
//     });
//     if (!comment) throw new NotFoundException('Comment not found');
//     const result = this.commentRepo.remove(comment);
//     super.engagementEmitter.emit(EngagementEvent.COMMENT_DELETED, { result });
//   }
// }
