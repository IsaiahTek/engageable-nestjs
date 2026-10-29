import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Request,
  NotFoundException,
  BadRequestException,
  Delete,
  Put,
  Inject,
  Query,
} from '@nestjs/common';
import { EngagementService } from '../services/engagement.service';
import { ApiProperty, ApiQuery, ApiTags } from '../utils/swagger.util';
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

const ACTION_MAP: Record<string, EngagementActionType> = {
  repost: EngagementActionType.repost,
  reposts: EngagementActionType.repost,
  bookmark: EngagementActionType.bookmark,
  bookmarks: EngagementActionType.bookmark,
  share: EngagementActionType.share,
  shares: EngagementActionType.share,
  follow: EngagementActionType.follow,
  follows: EngagementActionType.follow,
};

@ApiTags('Engagement')
@Controller({ path: 'engagement', version: '1' })
export class EngagementController {
  constructor(
    private readonly service: EngagementService,
    private readonly actionService: EngagementActionService,
    private readonly commentService: CommentService,
    private readonly likeService: LikeService,
    private readonly reviewService: ReviewService,
    @Inject(AUTH_GUARD_KEY) private readonly AuthGuard: any,
  ) {}

  private extractUserId(req: any): string | undefined {
    return req.user?.id ?? req.user?.userId ?? req.user?.sub;
  }

  private checkIsRegisteredRoute(targetType: string) {
    if (!EngagementRegistry.isRegisteredByTypeName(targetType)) {
      throw new NotFoundException(
        `Engageable type '${targetType}' is not registered. Allowed types: [${EngagementRegistry.list().join(', ')}]`,
      );
    }
  }

  private parseActionType(action: string): EngagementActionType {
    const normalized = action?.toLowerCase?.();
    const actionType = ACTION_MAP[normalized];
    if (!actionType) {
      throw new BadRequestException(
        `Invalid action '${action}'. Allowed actions: [${Object.values(EngagementActionType).join(', ')}]`,
      );
    }
    return actionType;
  }

  // ----------------------------------------------------------------------
  // GLOBAL ACTIONS
  // ----------------------------------------------------------------------
  
  @Get('/likes')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllLikes(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.likeService.getAllLikes({ page, limit });
  }

  @Get('/comments')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllComments(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.commentService.getAllComments({ page, limit });
  }

  @Get('/reviews')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllReviews(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.reviewService.getAllReviews({ page, limit });
  }

  @Get('/:action')
  @ApiProperty({ enum: EngagementActionType })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllActions(
    @Param('action') action: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const validAction = this.parseActionType(action);
    return this.actionService.getAllActions(validAction, { page, limit });
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
    const userId = this.extractUserId(req);
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
    const userId = this.extractUserId(req);
    return this.commentService.addComment(
      userId,
      targetType,
      targetId,
      commentDto.comment,
      commentDto.parentId,
    );
  }

  @UseEngagementAuth()
  @Delete(':targetType/:targetId/comment/:commentId')
  async deleteComment(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
    @Param('commentId') commentId: string,
    @Request() req: any,
  ) {
    this.checkIsRegisteredRoute(targetType);
    const userId = this.extractUserId(req);
    return this.commentService.removeComment(commentId, userId);
  }

  @UseEngagementAuth()
  @Put(':targetType/:targetId/comment/:commentId')
  async updateComment(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
    @Param('commentId') commentId: string,
    @Body() commentDto: CommentDto,
    @Request() req: any,
  ) {
    this.checkIsRegisteredRoute(targetType);
    const userId = this.extractUserId(req);
    return this.commentService.updateComment(commentId, commentDto.comment, userId);
  }

  // ----------------------------------------------------------------------
  // REVIEW ROUTES
  // ----------------------------------------------------------------------

  @Get(':targetType/:targetId/reviews/summary')
  async getReviewSummary(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
  ) {
    this.checkIsRegisteredRoute(targetType);
    return this.reviewService.getReviewSummary(targetType, targetId);
  }

  @Get(':targetType/:targetId/reviews')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getReviews(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    this.checkIsRegisteredRoute(targetType);
    return this.reviewService.getReviews(targetType, targetId, { page, limit });
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
    const userId = this.extractUserId(req);
    return this.reviewService.addReview(userId, targetType, targetId, reviewDto);
  }

  @UseEngagementAuth()
  @Put(':targetType/:targetId/review/:reviewId')
  async updateReview(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
    @Param('reviewId') reviewId: string,
    @Body() reviewDto: ReviewDto,
    @Request() req: any,
  ) {
    this.checkIsRegisteredRoute(targetType);
    const userId = this.extractUserId(req);
    return this.reviewService.updateReview(reviewId, reviewDto, userId);
  }

  @UseEngagementAuth()
  @Delete(':targetType/:targetId/review/:reviewId')
  async deleteReview(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
    @Param('reviewId') reviewId: string,
    @Request() req: any,
  ) {
    this.checkIsRegisteredRoute(targetType);
    const userId = this.extractUserId(req);
    return this.reviewService.deleteReview(reviewId, userId);
  }
  
  // ----------------------------------------------------------------------
  // GENERIC ACTION ROUTES (e.g., bookmark, repost, follow)
  // ----------------------------------------------------------------------

  @Get([':targetType/:targetId/action/:action', ':targetType/:targetId/actions/:action'])
  async countActions(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
    @Param('action') action: string,
  ) {
    this.checkIsRegisteredRoute(targetType);
    const validAction = this.parseActionType(action);
    return {
      count: await this.actionService.countActions(
        targetType,
        targetId,
        validAction,
      ),
    };
  }

  @UseEngagementAuth()
  @Post([':targetType/:targetId/action/:action', ':targetType/:targetId/actions/:action'])
  async toggleAction(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
    @Param('action') action: string,
    @Request() req: any,
  ) {
    this.checkIsRegisteredRoute(targetType);
    const validAction = this.parseActionType(action);
    const userId = this.extractUserId(req); 
    return this.actionService.toggleAction(
      userId,
      targetType,
      targetId,
      validAction,
    );
  }
}

