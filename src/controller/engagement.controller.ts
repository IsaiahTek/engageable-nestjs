import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Request,
  NotFoundException,
  Delete,
  Put,
  Inject,
} from '@nestjs/common';
import { EngagementService } from '../services/engagement.service';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { EngagementRegistry } from '../registry/engagement.registry';
import { CommentDto } from '../dto/comment.dto';
import { CommentService } from '../services/comment.service';
import { EngagementActionService } from '../services/engagement-action.service';
import { EngagementActionType } from '../interfaces/user_entity.type';
import { LikeService } from '../services/like.service';
import { AUTH_GUARD_KEY } from '../utils/constants';
import { UseEngagementAuth } from '../decorators/auth.decorator';
import { ReviewService } from '../services/review.service';
import { ReviewDto } from '../dto/review.dto';

@ApiTags('Engagement')
@Controller({ path: 'engagement', version: '1' })
export class EngagementController {
  constructor(
    private readonly service: EngagementService, // Base service remains for config/injection
    private readonly actionService: EngagementActionService,
    private readonly commentService: CommentService,
    private readonly likeService: LikeService,
    private readonly reviewService: ReviewService,
    @Inject(AUTH_GUARD_KEY) private readonly AuthGuard: any,
  ) {}

  private checkIsRegisteredRoute(targetType: string) {
    if (!EngagementRegistry.isRegisteredByTypeName(targetType)) {
      throw new NotFoundException(
        `Engageable type '${targetType}' is not registered. Allowed types: [${EngagementRegistry.list().join(', ')}]`,
      );
    }
  }

  // ----------------------------------------------------------------------
  // REMOVED OBSOLETE ROUTES (Due to EngagementTarget deletion)
  // ----------------------------------------------------------------------

  // @Get(':targetType/:targetId') // Removed: service.getTarget() no longer exists
  // @Get('/targets') // Removed: service.getTargets() no longer exists
  // @Delete(':targetType/:targetId') // Removed: service.deleteTarget() no longer exists
  // @Delete('/targets') // Removed: service.deleteTargets() no longer exists

  // ----------------------------------------------------------------------
  // GLOBAL ACTIONS
  // ----------------------------------------------------------------------

  @Get('/comments')
  async getAllComments() {
    return this.commentService.getAllComments();
  }

  @Get('/reviews')
  async getAllRevies() {
    return this.reviewService.getAllReviews();
  }

  @Get('/:action')
  @ApiProperty({ enum: EngagementActionType })
  async getAllActions(@Param('action') action: EngagementActionType) {
    return this.actionService.getAllActions(action);
  }
  
  // ----------------------------------------------------------------------
  // LIKE ROUTES
  // ----------------------------------------------------------------------
  
  @Get(':targetType/:targetId/likes')
  async countLikes(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
  ) {
    this.checkIsRegisteredRoute(targetType);
    return {
      count: await this.likeService.countLikes(targetType, targetId),
    };
  }

  @UseEngagementAuth()
  @Post(':targetType/:targetId/like')
  async toggleLike(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
    @Request() req: any,
  ) {
    this.checkIsRegisteredRoute(targetType);
    const userId = req.user?.id;
    return this.likeService.toggleLike(userId, targetType, targetId);
  }

  // ----------------------------------------------------------------------
  // COMMENT ROUTES
  // ----------------------------------------------------------------------

  @Get(':targetType/:targetId/comments')
  async getComments(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
  ) {
    this.checkIsRegisteredRoute(targetType);
    return this.commentService.getComments(targetType, targetId);
  }

  @UseEngagementAuth()
  @Post(':targetType/:targetId/comment')
  async addComment(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
    @Body() commentDto: CommentDto,
    @Request() req: any,
  ) {
    this.checkIsRegisteredRoute(targetType);
    const userId = req.user?.id;
    return this.commentService.addComment(
      userId,
      targetType,
      targetId,
      commentDto.comment,
    );
  }

  @UseEngagementAuth()
  @Delete(':targetType/:targetId/comment/:commentId')
  async deleteComment( // Renamed from deleteLike for clarity
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
    @Param('commentId') commentId: string,
  ) {
    this.checkIsRegisteredRoute(targetType);
    return this.commentService.removeComment(commentId);
  }

  @UseEngagementAuth()
  @Put(':targetType/:targetId/comment/:commentId')
  async updateComment(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
    @Param('commentId') commentId: string,
    @Body() commentDto: CommentDto,
  ) {
    this.checkIsRegisteredRoute(targetType);
    return this.commentService.updateComment(commentId, commentDto.comment);
  }

  // ----------------------------------------------------------------------
  // REVIEW ROUTES
  // ----------------------------------------------------------------------

  @Get(':targetType/:targetId/reviews')
  async getReviews(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
  ) {
    this.checkIsRegisteredRoute(targetType);
    return this.reviewService.getReviews(targetType, targetId);
  }

  @UseEngagementAuth()
  @Post(':targetType/:targetId/review')
  async addReview(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
    @Body() reviewDto: ReviewDto,
    @Request() req: any,
  ) {
    this.checkIsRegisteredRoute(targetType);
    const userId = req.user?.id;
    return this.reviewService.addReview(userId, targetType, targetId, reviewDto);
  }

  @UseEngagementAuth()
  @Put(':targetType/:targetId/review/:reviewId')
  async updateReview(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
    @Param('reviewId') reviewId: string,
    @Body() reviewDto: ReviewDto,
  ) {
    this.checkIsRegisteredRoute(targetType);
    return this.reviewService.updateReview(reviewId, reviewDto);
  }

  @UseEngagementAuth()
  @Delete(':targetType/:targetId/review/:reviewId')
  async deleteReview(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
    @Param('reviewId') reviewId: string,
  ) {
    this.checkIsRegisteredRoute(targetType);
    return this.reviewService.deleteReview(reviewId);
  }
  
  // ----------------------------------------------------------------------
  // GENERIC ACTION ROUTES (e.g., bookmark, repost, follow)
  // ----------------------------------------------------------------------

  @Get(':targetType/:targetId/action/:action' + 's')
  async countActions(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
    @Param('action') action: EngagementActionType,
  ) {
    this.checkIsRegisteredRoute(targetType);
    return {
      count: await this.actionService.countActions(
        targetType,
        targetId,
        action,
      ),
    };
  }

  @UseEngagementAuth()
  @Post(':targetType/:targetId/action/:action')
  async toggleAction(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
    @Param('action') action: EngagementActionType,
    @Request() req: any,
  ) {
    this.checkIsRegisteredRoute(targetType);
    // userId is extracted from req.user (already checked by UseEngagementAuth)
    const userId = req.user?.id; 

    // The ActionService.toggleAction expects userId as the first argument, not the entire user object
    return this.actionService.toggleAction(
      userId,
      targetType,
      targetId,
      action,
    );
  }
}








// // engagement.controller.ts
// import {
//   Controller,
//   Post,
//   Get,
//   Param,
//   Body,
//   Request,
//   NotFoundException,
//   Delete,
//   Put,
//   Inject,
// } from '@nestjs/common';
// import { EngagementService } from '../services/engagement.service';
// import { ApiProperty, ApiTags } from '@nestjs/swagger';
// import { EngagementRegistry } from '../registry/engagement.registry';
// import { CommentDto } from '../dto/comment.dto';
// import { CommentService } from '../services/comment.service';
// import { EngagementActionService } from '../services/engagement-action.service';
// import { EngagementActionType } from '../interfaces/user_entity.type';
// import { LikeService } from '../services/like.service';
// import { AUTH_GUARD_KEY } from '../utils/constants';
// import { UseEngagementAuth } from '../decorators/auth.decorator';
// import { ReviewService } from '../services/review.service';
// import { ReviewDto } from '../dto/review.dto';

// @ApiTags('Engagement')
// @Controller({ path: 'engagement', version: '1' })
// export class EngagementController {
//   constructor(
//     private readonly service: EngagementService,
//     private readonly actionService: EngagementActionService,
//     private readonly commentService: CommentService,
//     private readonly likeService: LikeService,
//     private readonly reviewService: ReviewService,
//     @Inject(AUTH_GUARD_KEY) private readonly AuthGuard: any,
//   ) {}

//   private checkIsRegisteredRoute(targetType: string) {
//     if (!EngagementRegistry.isRegisteredByTypeName(targetType)) {
//       throw new NotFoundException(
//         `Engageable type '${targetType}' is not registered. Allowed types: [${EngagementRegistry.list().join(', ')}]`,
//       );
//     }
//   }

//   @Get(':targetType/:targetId')
//   async getTarget(
//     @Param('targetType') targetType: string,
//     @Param('targetId') targetId: string,
//   ) {
//     this.checkIsRegisteredRoute(targetType);
//     return this.service.getTarget(targetType, targetId);
//   }

//   @Get('/targets')
//   async getTargets() {
//     return this.service.getTargets();
//   }

//   @Get('/comments')
//   async getAllComments() {
//     return this.commentService.getAllComments();
//   }

//   @Get('/reviews')
//   async getAllRevies(){
//     return this.reviewService.getAllReviews();
//   }

//   @Get('/:action')
//   @ApiProperty({ enum: EngagementActionType })
//   async getAllLikes(@Param('action') action: EngagementActionType) {
//     console.log(action);
//     return this.actionService.getAllActions(action);
//   }

//   @Delete(':targetType/:targetId')
//   async deleteTarget(
//     @Param('targetType') targetType: string,
//     @Param('targetId') targetId: string,
//   ) {
//     this.checkIsRegisteredRoute(targetType);
//     return this.service.deleteTarget(targetType, targetId);
//   }

//   @Delete('/targets')
//   async deleteTargets() {
//     return this.service.deleteTargets();
//   }

//   @Get(':targetType/:targetId/likes')
//   async countLikes(
//     @Param('targetType') targetType: string,
//     @Param('targetId') targetId: string,
//   ) {
//     this.checkIsRegisteredRoute(targetType);
//     return {
//       count: await this.likeService.countLikes(targetType, targetId),
//     };
//   }

//   @UseEngagementAuth()
//   @Post(':targetType/:targetId/like')
//   async addLike(
//     @Param('targetType') targetType: string,
//     @Param('targetId') targetId: string,
//     @Request() req: any,
//   ) {
//     this.checkIsRegisteredRoute(targetType);
//     const userId = req.user?.id; // Extract the ID from the authenticated user
//     console.log('addLike: ', req.user, userId, targetType, targetId);
//     return this.likeService.toggleLike(userId, targetType, targetId);
//   }

//   @UseEngagementAuth()
//   @Post(':targetType/:targetId/comment')
//   async addComment(
//     @Param('targetType') targetType: string,
//     @Param('targetId') targetId: string,
//     @Body() commentDto: CommentDto,
//     @Request() req: any,
//   ) {
//     this.checkIsRegisteredRoute(targetType);
//     const userId = req.user?.id; // Extract the ID from the authenticated user
//     console.log('addComment: ', req.user, userId, targetType, targetId);
//     return this.commentService.addComment(
//       userId,
//       targetType,
//       targetId,
//       commentDto.comment,
//     );
//   }

//   @Get(':targetType/:targetId/comments')
//   async getComments(
//     @Param('targetType') targetType: string,
//     @Param('targetId') targetId: string,
//   ) {
//     this.checkIsRegisteredRoute(targetType);
//     return this.commentService.getComments(targetType, targetId);
//   }

//   @UseEngagementAuth()
//   @Delete(':targetType/:targetId/comment/:commentId')
//   async deleteLike(
//     @Param('targetType') targetType: string,
//     @Param('targetId') targetId: string,
//     @Param('commentId') commentId: string,
//   ) {
//     this.checkIsRegisteredRoute(targetType);
//     return this.commentService.removeComment(commentId);
//   }

//   @UseEngagementAuth()
//   @Put(':targetType/:targetId/comment/:commentId')
//   async updateComment(
//     @Param('targetType') targetType: string,
//     @Param('targetId') targetId: string,
//     @Param('commentId') commentId: string,
//     @Body() commentDto: CommentDto, // TODO: add commentDto to update,
//   ) {
//     this.checkIsRegisteredRoute(targetType);
//     return this.commentService.updateComment(commentId, commentDto.comment);
//   }

//   @Get(':targetType/:targetId/reviews')
//   async getReviews(
//     @Param('targetType') targetType: string,
//     @Param('targetId') targetId: string,
//   ) {
//     this.checkIsRegisteredRoute(targetType);
//     return this.reviewService.getReviews(targetType, targetId);
//   }

//   @UseEngagementAuth()
//   @Post(':targetType/:targetId/review')
//   async addReview(
//     @Param('targetType') targetType: string,
//     @Param('targetId') targetId: string,
//     @Body() reviewDto: ReviewDto,
//     @Request() req: any,
//   ) {
//     this.checkIsRegisteredRoute(targetType);
//     const userId = req.user?.id; // Extract the ID from the authenticated user
//     console.log('addReview: ', req.user, userId, targetType, targetId);
//     return this.reviewService.addReview(
//       userId,
//       targetType,
//       targetId,
//       reviewDto,
//     );
//   }

//   @UseEngagementAuth()
//   @Put(':targetType/:targetId/review/:reviewId')
//   async updateReview(
//     @Param('targetType') targetType: string,
//     @Param('targetId') targetId: string,
//     @Param('reviewId') reviewId: string,
//     @Body() reviewDto: ReviewDto,
//   ) {
//     this.checkIsRegisteredRoute(targetType);
//     return this.reviewService.updateReview(reviewId, reviewDto);
//   }

//   @UseEngagementAuth()
//   @Delete(':targetType/:targetId/review/:reviewId')
//   async deleteReview(
//     @Param('targetType') targetType: string,
//     @Param('targetId') targetId: string,
//     @Param('reviewId') reviewId: string,
//   ) {
//     this.checkIsRegisteredRoute(targetType);
//     return this.reviewService.deleteReview(reviewId);
//   }
  

//   @Get(':targetType/:targetId/action/:action' + 's')
//   async countActions(
//     @Param('targetType') targetType: string,
//     @Param('targetId') targetId: string,
//     @Param('action') action: EngagementActionType,
//   ) {
//     console.log(action);
//     this.checkIsRegisteredRoute(targetType);
//     return {
//       count: await this.actionService.countActions(
//         targetType,
//         targetId,
//         action,
//       ),
//     };
//   }

//   @UseEngagementAuth()
//   @Post(':targetType/:targetId/action/:action')

//   async toggleAction(
//     @Param('targetType') targetType: string,
//     @Param('targetId') targetId: string,
//     @Param('action') action: EngagementActionType,
//     @Request() req: any,
//   ) {
//     this.checkIsRegisteredRoute(targetType);
//     return this.actionService.toggleAction(
//       req.user,
//       targetType,
//       targetId,
//       action,
//     );
//   }
// }
