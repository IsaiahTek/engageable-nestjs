// review.service.ts

import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { EngagementService } from "./engagement.service";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
// import { EngagementTarget } from "../entities/engagement-target.entity"; // REMOVED
import { EngagementEmitter } from "../event-emitters/engagement.emitter";
import { EngagementOptions } from "../interfaces/engagement-options.interface";
import { UserEntityKey, EngagementOptionsKey } from "../utils/constants";
import { DataSource, Repository } from "typeorm";
import { Review } from "../entities/review.entity";
import { EngagementEvent } from "../utils/enums";
import { ReviewDto } from "../dto/review.dto";

@Injectable()
export class ReviewService extends EngagementService {
  constructor(
    @InjectDataSource() protected readonly dataSource: DataSource,
    // @InjectRepository(EngagementTarget) // REMOVED
    // protected targetRepo: Repository<EngagementTarget>, // REMOVED
    @Inject(UserEntityKey) protected readonly userEntity: any,
    @Inject(EngagementOptionsKey) protected options: EngagementOptions,
    protected readonly engagementEmitter: EngagementEmitter,
    @InjectRepository(Review)
    protected reviewRepo: Repository<Review>,
  ) {
    // Corrected super() call to match the simplified EngagementService
    super(dataSource, userEntity, options, engagementEmitter);
  }

  async getAllReviews() {
    console.log("Trying to fetch reviews");
    const result = await this.reviewRepo.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    console.log("Reviews: ", result);
    return result;
  }

  async addReview(userId: any, targetType: string, targetId: string, review: ReviewDto) {
    if (this.hasUserSupport && !this.options.allowAnonymous) {
      if (!userId) {
        throw new ForbiddenException('Authentication required to review'); // Changed message to 'review'
      }

      const userRepo = this.dataSource.getRepository(this.userEntity);
      const user = await userRepo.findOne({ where: { id: userId } });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return this._addReview({ user, targetType, targetId, review });
    } else {
      // Anonymous engagement
      return this._addReview({ user: null, targetType, targetId, review });
    }
  }

  async _addReview({ user, targetType, targetId, review }: { user: any, targetType: string, targetId: string, review: ReviewDto }) {
    console.log("About to add review: ", user, targetType, targetId, review)

    // REMOVED: const target = await this.ensureTarget(targetType, targetId);
    // REMOVED: console.log("Found target: ", target)

    // Create the review entity, using targetType and targetId directly
    const addedReview = this.reviewRepo.create({
      text: review.text,
      rating: review.rating,
      user,
      // engagement: target, // REMOVED
      targetId: targetId,   // Use polymorphic ID directly
      targetType: targetType, // Use polymorphic Type directly
    });
    await this.reviewRepo.save(addedReview);

    this.engagementEmitter.emit(EngagementEvent.REVIEW_CREATED, {
      review: addedReview,
    });
    console.log("Added review: ", addedReview, user, targetType, targetId, review);
    return addedReview;
  }

  async getReviews(targetType: string, targetId: string) {
    return this._getReviews(targetType, targetId);
  }

  async _getReviews(targetType: string, targetId: string) {
    // REMOVED: const target = await this.ensureTarget(targetType, targetId);

    // Query directly on the polymorphic columns
    return this.reviewRepo.find({
      where: { 
        targetType, // Direct filter
        targetId    // Direct filter
        // engagement: { id: target.id } // REMOVED
      },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  // deleteReview and updateReview remain correct as they query by ID only.

  async deleteReview(reviewId: string) {
    const review = await this.reviewRepo.findOne({
      where: { id: reviewId },
    });
    if (!review) throw new NotFoundException('Review not found');
    const result = await this.reviewRepo.remove(review);
    // Optional: Add event emission here for consistency
    this.engagementEmitter.emit(EngagementEvent.REVIEW_DELETED, { reviewId });
    return result;
  }

  async updateReview(reviewId: string, reviewDto: ReviewDto) {
    const review = await this.reviewRepo.findOne({
      where: { id: reviewId },
    });
    if (!review) throw new NotFoundException('Review not found');
    review.text = reviewDto.text;
    review.rating = reviewDto.rating;
    return this.reviewRepo.save(review);
  }
}



// import { ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
// import { EngagementService } from "./engagement.service";
// import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
// import { EngagementTarget } from "../entities/engagement-target.entity";
// import { EngagementEmitter } from "../event-emitters/engagement.emitter";
// import { EngagementOptions } from "../interfaces/engagement-options.interface";
// import { UserEntityKey, EngagementOptionsKey } from "../utils/constants";
// import { DataSource, Repository } from "typeorm";
// import { Review } from "../entities/review.entity";
// import { EngagementEvent } from "../utils/enums";
// import { ReviewDto } from "../dto/review.dto";

// @Injectable()
// export class ReviewService extends EngagementService {
//     constructor(
//         @InjectDataSource() protected readonly dataSource: DataSource,
//         @InjectRepository(EngagementTarget)
//         protected targetRepo: Repository<EngagementTarget>,
//         @Inject(UserEntityKey) protected readonly userEntity: any,
//         @Inject(EngagementOptionsKey) protected options: EngagementOptions,
//         protected readonly engagementEmitter: EngagementEmitter,
//         @InjectRepository(Review)
//         protected reviewRepo: Repository<Review>,
//     ) {
//         super(dataSource, targetRepo, userEntity, options, engagementEmitter);
//     }

//     async getAllReviews() {
//         console.log("Trying to fetch reviews")
//         const result = await this.reviewRepo.find({
//             relations: ['user'],
//             order: { createdAt: 'DESC' },
//         });

//         console.log("Reviews: ", result);
//         return result;
//     }

//     async addReview(userId: any, targetType: string, targetId: string, review: ReviewDto) {

//             if (this.hasUserSupport && !this.options.allowAnonymous) {
//               if (!userId) {
//                 throw new ForbiddenException('Authentication required to like');
//               }
        
//               const userRepo = this.dataSource.getRepository(this.userEntity);
//               const user = await userRepo.findOne({ where: { id: userId } });
        
//               if (!user) {
//                 throw new NotFoundException('User not found');
//               }
        
//               return this._addReview({user, targetType, targetId, review});
//             } else {
//               // Anonymous engagement
//               return this._addReview({user:null, targetType, targetId, review});
//             }
//     }

//     async _addReview({user, targetType, targetId, review}: {user: any, targetType: string, targetId: string, review: ReviewDto}) {
//         console.log("About to add comment: ", user, targetType, targetId, review)
//         const target = await this.ensureTarget(targetType, targetId);
//         console.log("Found target: ", target)
//         // const reviewEntity = new Review();
//         // reviewEntity.text = review.text;
//         // reviewEntity.rating = review.rating;
//         // reviewEntity.user = user;
//         // reviewEntity.engagement = target;
//         // const addedReview = await this.reviewRepo.save(reviewEntity);

//         const addedReview = this.reviewRepo.create({
//             text: review.text,
//             rating: review.rating,
//             user,
//             engagement: target,
//             targetId: target.id,
//             targetType: targetType,
//         });
//         await this.reviewRepo.save(addedReview);

//         this.engagementEmitter.emit(EngagementEvent.REVIEW_CREATED, {
//             review: addedReview,
//         });
//         console.log("Added review: ", addedReview, user, targetType, targetId, review, target);
//         return addedReview;
//     }

//     async getReviews(targetType: string, targetId: string) {
//         return this._getReviews(targetType, targetId);
//     }

//     async _getReviews(targetType: string, targetId: string) {
//         const target = await this.ensureTarget(targetType, targetId);
//         return this.reviewRepo.find({
//             where: { engagement: { id: target.id } },
//             relations: ['user'],
//             order: { createdAt: 'DESC' },
//         });
//     }

//     async deleteReview(reviewId: string) {
//         const review = await this.reviewRepo.findOne({
//             where: { id: reviewId },
//         });
//         if (!review) throw new NotFoundException('Review not found');
//         return this.reviewRepo.remove(review);
//     }

//     async updateReview(reviewId: string, reviewDto: ReviewDto) {
//         const review = await this.reviewRepo.findOne({
//             where: { id: reviewId },
//         });
//         if (!review) throw new NotFoundException('Review not found');
//         review.text = reviewDto.text;
//         review.rating = reviewDto.rating;
//         return this.reviewRepo.save(review);
//     }
// }