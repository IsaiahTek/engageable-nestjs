# Engageable for NestJS

<p align="center">
  <img src="https://raw.githubusercontent.com/IsaiahTek/engageable-nestjs/main/images/engageable-nestjs-module-icon.png" alt="Engageable NestJs Module/Plugin" width="160" />
</p>

<p align="center">
  <strong>A modular, polymorphic social interaction & engagement engine for NestJS & TypeORM applications.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/engageable-nestjs"><img src="https://img.shields.io/npm/v/engageable-nestjs.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/package/engageable-nestjs"><img src="https://img.shields.io/npm/dm/engageable-nestjs.svg" alt="NPM Downloads" /></a>
  <a href="https://github.com/IsaiahTek/engageable/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License" /></a>
</p>

---

**Engageable** is a plug-and-play **NestJS engagement module** that adds social interaction features — including **likes**, **threaded comments & replies**, **reviews & star ratings (0–5)**, **reposts**, **bookmarks**, **shares**, and **follows** — to any entity in your application with zero schema duplication.

Built on **TypeORM** and **NestJS best practices**, Engageable leverages polymorphic relationships (`targetType` + `targetId`) so you can attach engagements to posts, articles, products, videos, fundraisers, or even comments themselves, without altering your existing database tables.

---

## Table of Contents

- [Features](#features)
- [Architecture & Design](#architecture--design)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Module Configuration (`EngagementOptions`)](#module-configuration-engagementoptions)
- [Decorating Entities (`@Engageable`)](#decorating-entities-engageable)
- [REST API Endpoints](#rest-api-endpoints)
  - [Global Endpoints](#global-endpoints)
  - [Likes Endpoints](#likes-endpoints)
  - [Comments & Nested Replies Endpoints](#comments--nested-replies-endpoints)
  - [Reviews & Ratings Endpoints](#reviews--ratings-endpoints)
  - [Actions Endpoints (Bookmarks, Reposts, Shares, Follows)](#actions-endpoints-bookmarks-reposts-shares-follows)
- [Injectable Services (Programmatic Usage)](#injectable-services-programmatic-usage)
  - [LikeService](#likeservice)
  - [CommentService](#commentservice)
  - [ReviewService](#reviewservice)
  - [EngagementActionService](#engagementactionservice)
- [High-Performance Batch Hydration (`EngageablePlugin`)](#high-performance-batch-hydration-engageableplugin)
- [Event-Driven Architecture (`EngagementEvent`)](#event-driven-architecture-engagementevent)
- [Authentication & Custom Guards](#authentication--custom-guards)
- [Database Entities](#database-entities)
- [License & Contributing](#license--contributing)

---

## Features

- ✅ **Polymorphic Architecture**: Target any entity (e.g., `post`, `product`, `fundraiser`, `comment`) via generic `targetType` and `targetId` fields.
- ❤️ **Likes System**: Toggle likes (like/unlike) with duplicate prevention, like counts, and likes on comments.
- 💬 **Threaded Comments & Replies**: Hierarchical comment threads supporting infinite nested replies (`replies`), comment likes, and author relations.
- ⭐ **Reviews & Star Ratings**: Submit ratings from `0.0` to `5.0` in half-step increments (`0.5`) with review text, backed by custom validation (`@IsHalfStep()`).
- 🔖 **Social Actions**: Built-in support for **reposts**, **bookmarks**, **shares**, and **follows**, complete with custom JSON metadata.
- ⚡ **Zero N+1 Query Batch Plugin (`EngageablePlugin`)**: Fetch paginated entities and automatically batch-hydrate comments, recursive reply trees, likes, and actions in one efficient query cycle.
- 🔔 **Event Emitter Integration**: Automatically emits domain events (`EngagementEvent.*`) via `@nestjs/event-emitter` on create/delete of likes, comments, reviews, and actions.
- 🔒 **Flexible Authentication**: Works seamlessly with your existing auth guard (e.g., JWT) or supports anonymous engagements (`allowAnonymous: true`).
- 🧩 **Dynamic User Relations**: Dynamically registers TypeORM `ManyToOne` relations between your application's `User` entity and all engagement tables at boot time.
- 📖 **Swagger / OpenAPI Ready**: Built-in endpoints are decorated with `@nestjs/swagger` annotations.

---

## Architecture & Design

Instead of creating dedicated junction tables for every engageable model in your database, Engageable uses a clean polymorphic approach:

```
┌────────────────────────────────────────────────────────┐
│                      Your Entities                     │
│        (Post, Article, Product, Fundraiser, etc.)      │
└───────────────────────────┬────────────────────────────┘
                            │
               targetType + targetId
                            │
         ┌──────────────────┴──────────────────┐
         ▼                                     ▼
┌──────────────────┐                  ┌──────────────────┐
│ engageable_likes │                  │engageable_comments│ (recursive replies)
└──────────────────┘                  └──────────────────┘
         ▲                                     ▲
         ▼                                     ▼
┌──────────────────┐                  ┌──────────────────┐
│engageable_reviews│ (0 - 5.0 rating) │engagement_actions│ (bookmark, repost,
└──────────────────┘                  └──────────────────┘  share, follow)
```

---

## Installation

Install `engageable-nestjs` and its peer dependencies:

```bash
# Using npm
npm install engageable-nestjs @nestjs/event-emitter @nestjs/typeorm typeorm class-validator class-transformer

# Using yarn
yarn add engageable-nestjs @nestjs/event-emitter @nestjs/typeorm typeorm class-validator class-transformer

# Using pnpm
pnpm add engageable-nestjs @nestjs/event-emitter @nestjs/typeorm typeorm class-validator class-transformer
```

> **Note:** If you use Swagger in your NestJS application, ensure `@nestjs/swagger` is also installed.

---

## Quick Start

### 1. Register the Module

Import `EngagementModule.register(...)` into your root `AppModule`:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EngagementModule, Like, Comment, Review, EngagementAction } from 'engageable-nestjs';
import { User } from './users/entities/user.entity';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'mydb',
      autoLoadEntities: true, // or explicitly add [Like, Comment, Review, EngagementAction, User]
      synchronize: true,      // Set to false in production
    }),
    EngagementModule.register({
      userEntity: User,            // Links engagements to your User entity
      authGuard: JwtAuthGuard,     // Guard to protect engagement write actions
      allowAnonymous: false,       // Set true to allow unauthenticated interactions
      emitEvents: true,            // Emit EventEmitter events on engagement actions
    }),
  ],
})
export class AppModule {}
```

### 2. Mark Entities as Engageable

Decorate any TypeORM entity with `@Engageable()`:

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Engageable } from 'engageable-nestjs';

@Entity('posts')
@Engageable() // Defaults type name to 'post'
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  content: string;
}
```

You can optionally specify a custom type name:

```typescript
@Entity('blog_articles')
@Engageable('article') // Registered as 'article'
export class BlogArticle {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}
```

That's it! Your application now exposes a full REST API for liking, commenting, rating, bookmarking, and reposting `post` or `article` entities.

---

## Module Configuration (`EngagementOptions`)

The `EngagementModule.register(options)` method accepts the following options:

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `userEntity` | `EntityTarget<any>` | `null` | Your application's TypeORM user entity class (e.g., `User`). Used to wire relations to likes, comments, reviews, and actions. |
| `authGuard` | `any` | `DefaultEngagementAuthGuard` | Custom NestJS guard (e.g., `JwtAuthGuard`) used to protect authenticated engagement routes. |
| `allowAnonymous` | `boolean` | `false` | Whether unauthenticated requests can like, comment, review, or perform actions. If `true`, `userId` will be stored as `null`. |
| `emitEvents` | `boolean` | `true` | Whether to dispatch `@nestjs/event-emitter` events when engagements are created or deleted. |
| `engageableEntities` | `string[]` | `[]` | Explicit array of entity type names to register in `EngagementRegistry`. |
| `autoCreateTargets` | `boolean` | `true` | Internal target management flag. |
| `lazyLinking` | `boolean` | `true` | Enables lazy resolution of target relationships. |

---

## Decorating Entities (`@Engageable`)

### `@Engageable(typeName?: string)`
Registers an entity with the `EngagementRegistry`. When no argument is provided, the entity's lowercase class name is used.

```typescript
import { Engageable } from 'engageable-nestjs';

@Entity()
@Engageable() // targetType = 'product'
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}
```

### `@UseEngagementAuth()`
Applies the configured `authGuard` to custom controllers or routes:

```typescript
import { Controller, Post } from '@nestjs/common';
import { UseEngagementAuth } from 'engageable-nestjs';

@Controller('custom')
export class CustomController {
  @Post('action')
  @UseEngagementAuth()
  customAction() {
    return { ok: true };
  }
}
```

---

## REST API Endpoints

The module provides pre-configured REST endpoints mounted at `/engagement` (API Version 1: `/v1/engagement`).

### Global Endpoints

All global endpoints support optional pagination via query parameters: `?page=1&limit=20`.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/engagement/likes?page=1&limit=20` | Retrieve paginated likes across all entities (includes user). |
| `GET` | `/engagement/comments?page=1&limit=20` | Retrieve paginated comments (includes user, likes, replies). |
| `GET` | `/engagement/reviews?page=1&limit=20` | Retrieve paginated reviews (includes user and ratings). |
| `GET` | `/engagement/:action?page=1&limit=20` | Retrieve paginated actions for `:action` (`repost`, `bookmark`, `share`, `follow`). |

---

### Likes Endpoints

#### Toggle Like
Toggles a like for the given entity. If the user already liked it, it unlikes; otherwise, it creates a like. Includes duplicate prevention via database unique constraints.

- **URL:** `POST /engagement/:targetType/:targetId/like`
- **Auth:** Required (via configured `authGuard`)
- **Params:**
  - `targetType`: The engageable entity name (e.g. `post`, `comment`, `product`)
  - `targetId`: UUID/ID of the target entity

#### Count Likes
Returns the total number of likes for a target.

- **URL:** `GET /engagement/:targetType/:targetId/likes`
- **Response:**
  ```json
  {
    "count": 42
  }
  ```

---

### Comments & Nested Replies Endpoints

#### Get Comments Tree
Fetches top-level comments and their full recursive tree of nested replies, including author information and comment likes. Assembled with an optimized single-query in-memory tree builder.

- **URL:** `GET /engagement/:targetType/:targetId/comments`
- **Response:**
  ```json
  [
    {
      "id": "c1f7a2d4-...",
      "content": "This is a root comment!",
      "createdAt": "2026-10-27T08:00:00.000Z",
      "user": { "id": "u1", "name": "Alice" },
      "likes": [],
      "replies": [
        {
          "id": "c2b8e3a1-...",
          "content": "This is a reply to Alice!",
          "user": { "id": "u2", "name": "Bob" },
          "likes": [],
          "replies": []
        }
      ]
    }
  ]
  ```

#### Add Comment or Reply
Adds a new comment. To reply to another comment directly, pass `parentId` in the body.

- **URL:** `POST /engagement/:targetType/:targetId/comment`
- **Auth:** Required
- **Body:**
  ```json
  {
    "comment": "Awesome post! Thanks for sharing.",
    "parentId": "c1f7a2d4-..." // Optional: pass to reply to an existing comment
  }
  ```

#### Update Comment
Updates comment text. Enforces ownership: only the user who authored the comment can edit it.

- **URL:** `PUT /engagement/:targetType/:targetId/comment/:commentId`
- **Auth:** Required
- **Body:**
  ```json
  {
    "comment": "Updated comment content."
  }
  ```

#### Delete Comment
Deletes a comment and cascades to all nested replies and likes. Enforces ownership: only the author can delete their comment.

- **URL:** `DELETE /engagement/:targetType/:targetId/comment/:commentId`
- **Auth:** Required

---

### Reviews & Ratings Endpoints

#### Add Review
Adds a review with a numerical rating between `0.0` and `5.0` in `0.5` increments (e.g., `0.5`, `1.0`, `1.5`, ..., `5.0`). Ratings are automatically serialized as numbers.

- **URL:** `POST /engagement/:targetType/:targetId/review`
- **Auth:** Required
- **Body:**
  ```json
  {
    "text": "Exceptional quality and fast delivery!",
    "rating": 4.5
  }
  ```

#### Get Review Summary & Rating Distribution
Returns the average rating, total review count, and star distribution (from 0 to 5 stars).

- **URL:** `GET /engagement/:targetType/:targetId/reviews/summary`
- **Response:**
  ```json
  {
    "averageRating": 4.67,
    "totalReviews": 18,
    "distribution": {
      "5": 14,
      "4": 3,
      "3": 1,
      "2": 0,
      "1": 0,
      "0": 0
    }
  }
  ```

#### Get Reviews
Fetches all reviews for a target. Supports optional pagination query: `?page=1&limit=10`.

- **URL:** `GET /engagement/:targetType/:targetId/reviews`
- **Response:**
  ```json
  [
    {
      "id": "r7c1...",
      "text": "Exceptional quality and fast delivery!",
      "rating": 4.5,
      "createdAt": "2026-10-27T08:00:00.000Z",
      "user": { "id": "u1", "name": "Alice" }
    }
  ]
  ```

#### Update Review
Updates a review. Enforces ownership: only the author can update their review.

- **URL:** `PUT /engagement/:targetType/:targetId/review/:reviewId`
- **Auth:** Required
- **Body:**
  ```json
  {
    "text": "Updated review text",
    "rating": 5.0
  }
  ```

#### Delete Review
Deletes a review. Enforces ownership: only the author can delete their review.

- **URL:** `DELETE /engagement/:targetType/:targetId/review/:reviewId`
- **Auth:** Required

---

### Actions Endpoints (Bookmarks, Reposts, Shares, Follows)

Actions represent togglable social signals. Supported types: `repost`, `bookmark`, `share`, `follow`.

#### Toggle Action
- **URL:** `POST /engagement/:targetType/:targetId/action/:action`
- **Auth:** Required
- **Valid Actions:** `repost`, `bookmark`, `share`, `follow`
- **Response:**
  ```json
  {
    "created": true,
    "action": {
      "id": "a9d8...",
      "type": "bookmark",
      "targetType": "post",
      "targetId": "p123",
      "userId": "u1"
    }
  }
  ```
  *(Or `{ "removed": true }` if un-toggled)*

#### Count Actions
- **URL:** `GET /engagement/:targetType/:targetId/action/:actions`
- **Examples:**
  - `GET /engagement/post/123/action/bookmarks`
  - `GET /engagement/post/123/action/reposts`
  - `GET /engagement/post/123/action/shares`
  - `GET /engagement/post/123/action/follows`
- **Response:**
  ```json
  {
    "count": 18
  }
  ```

---

## Injectable Services (Programmatic Usage)

All services are exported by `EngagementModule` and can be injected into any service or controller in your NestJS application.

```typescript
import { Injectable } from '@nestjs/common';
import {
  LikeService,
  CommentService,
  ReviewService,
  EngagementActionService,
  EngagementActionType,
} from 'engageable-nestjs';

@Injectable()
export class PostService {
  constructor(
    private readonly likeService: LikeService,
    private readonly commentService: CommentService,
    private readonly reviewService: ReviewService,
    private readonly actionService: EngagementActionService,
  ) {}

  async likePost(userId: string, postId: string) {
    return this.likeService.toggleLike(userId, 'post', postId);
  }

  async getPostLikes(postId: string) {
    return this.likeService.countLikes('post', postId);
  }

  async replyToComment(userId: string, commentId: string, replyText: string) {
    return this.commentService.addComment(
      userId,
      'comment',   // targetType
      commentId,   // targetId
      replyText,
      commentId,   // parentId (wires nested reply hierarchy)
    );
  }

  async bookmarkPost(userId: string, postId: string) {
    return this.actionService.toggleAction(
      userId,
      'post',
      postId,
      EngagementActionType.bookmark,
    );
  }
}
```

### `LikeService`
- `toggleLike(userId: any, targetType: string, targetId: string)`: Toggle like on a target.
- `countLikes(targetType: string, targetId: string)`: Get total like count for target.
- `getAllLikes()`: Retrieve all likes with author relations.

### `CommentService`
- `addComment(userId: any, targetType: string, targetId: string, content: string, parentId?: string)`: Create comment or reply.
- `getComments(targetType: string, targetId: string)`: Get threaded comment tree.
- `getCommentReplies(commentId: string)`: Recursively fetch child replies for a comment.
- `updateComment(commentId: string, content: string)`: Update comment text.
- `removeComment(commentId: string)`: Remove comment.
- `getAllComments()`: Fetch all comments with relations.

### `ReviewService`
- `addReview(userId: any, targetType: string, targetId: string, review: ReviewDto)`: Add a review with rating (0–5).
- `getReviews(targetType: string, targetId: string, pagination?: { page?: number; limit?: number })`: Get reviews for target.
- `getReviewSummary(targetType: string, targetId: string)`: Get average rating, total count, and 0-5 star distribution.
- `updateReview(reviewId: string, reviewDto: ReviewDto, userId?: string)`: Update review with ownership check.
- `deleteReview(reviewId: string, userId?: string)`: Delete review with ownership check.
- `getAllReviews(pagination?: { page?: number; limit?: number })`: Fetch paginated reviews.

### `EngagementActionService`
- `toggleAction(userId: string, targetType: string, targetId: string, type: EngagementActionType, metadata?: Record<string, any>)`: Toggle an action.
- `countActions(targetType: string, targetId: string, action: EngagementActionType)`: Count actions of a specific type.
- `getAllActions(action: EngagementActionType, pagination?: { page?: number; limit?: number })`: Retrieve paginated actions with user relations.

---

## High-Performance Batch Hydration (`EngageablePlugin`)

When rendering feeds, lists of posts, or product catalogs, querying engagements individually produces severe N+1 query overhead.

The **`EngageablePlugin`** solves this by batch-fetching all comments (including recursive replies), likes, actions, and reviews for a collection of entities in parallel:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EngageablePlugin } from 'engageable-nestjs';
import { Post } from './entities/post.entity';

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    private readonly dataSource: DataSource,
  ) {}

  async getFeed(page = 1, limit = 10) {
    return EngageablePlugin.getEngageablesWithEngagements<Post>({
      rootType: 'post',
      repository: this.postRepo,
      dataSource: this.dataSource,
      pagination: { page, limit },
      where: { isPublished: true },
      transform: (post) => {
        // Customize the response object if desired
        return {
          id: post.id,
          title: post.title,
          content: post.content,
          engagements: post._engagements, // Structured engagement data!
        };
      },
    });
  }
}
```

### Result Object Structure
Each returned item is automatically populated with `_engagements`:

```typescript
item._engagements = {
  likes: Like[],              // All likes on this post
  actions: EngagementAction[], // All bookmarks, reposts, etc.
  comments: Comment[],        // Top-level comments with .replies trees
  reviews: Review[],          // All reviews on this item
};
```

---

## Event-Driven Architecture (`EngagementEvent`)

Engageable emits events via `@nestjs/event-emitter` whenever engagements change. You can listen to these events anywhere in your app to trigger notifications, update analytics, or recompute scores.

```typescript
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EngagementEvent } from 'engageable-nestjs';

@Injectable()
export class NotificationService {
  @OnEvent(EngagementEvent.LIKE_CREATED)
  handleLikeCreated(payload: string) {
    const { like } = JSON.parse(payload);
    console.log(`User ${like.userId} liked ${like.targetType}:${like.targetId}`);
    // Trigger push notification, email, or badge update
  }

  @OnEvent(EngagementEvent.COMMENT_CREATED)
  handleCommentCreated(payload: string) {
    const { comment } = JSON.parse(payload);
    console.log(`New comment by ${comment.userId}: "${comment.content}"`);
  }

  @OnEvent(EngagementEvent.REVIEW_CREATED)
  handleReviewCreated(payload: string) {
    const { review } = JSON.parse(payload);
    console.log(`New ${review.rating}-star review for ${review.targetType}`);
  }
}
```

### Available Events

| Event Constant | Event Name | Trigger |
| :--- | :--- | :--- |
| `EngagementEvent.LIKE_CREATED` | `engagement.like.created` | Emitted when a like is added. |
| `EngagementEvent.LIKE_DELETED` | `engagement.like.deleted` | Emitted when a like is removed. |
| `EngagementEvent.COMMENT_CREATED` | `engagement.comment.created` | Emitted when a comment or reply is added. |
| `EngagementEvent.COMMENT_DELETED` | `engagement.comment.deleted` | Emitted when a comment is deleted. |
| `EngagementEvent.REVIEW_CREATED` | `engagement.review.created` | Emitted when a review is added. |
| `EngagementEvent.REVIEW_DELETED` | `engagement.review.deleted` | Emitted when a review is deleted. |
| `EngagementEvent.ACTION_CREATED` | `engagement.action.created` | Emitted when an action (bookmark, repost, etc.) is created. |
| `EngagementEvent.ACTION_DELETED` | `engagement.action.deleted` | Emitted when an action is removed. |

---

## Authentication & Custom Guards

By default, Engageable secures mutable endpoints using the guard specified in `authGuard`:

```typescript
EngagementModule.register({
  authGuard: JwtAuthGuard, // Your application's guard
  allowAnonymous: false,
})
```

### How Request User Resolution Works
The auth guard should attach the authenticated user object or ID to `request.user`:

```typescript
// request.user can be:
request.user = { id: 'user-uuid-123', email: 'user@example.com' };
```

Engageable automatically extracts `req.user?.id` to associate with likes, comments, reviews, and actions.

If `allowAnonymous: true` is configured, unauthenticated requests can perform engagement actions with `userId` saved as `null`.

---

## Database Entities

Engageable creates the following tables in your database:

| Entity | Table Name | Columns | Description |
| :--- | :--- | :--- | :--- |
| `Like` | `engageable_likes` | `id`, `target_id`, `target_type`, `userId`, `commentId`, `createdAt`, `updatedAt` | Polymorphic likes on entities or comments. |
| `Comment` | `engageable_comments` | `id`, `target_id`, `target_type`, `userId`, `content`, `parentId`, `createdAt`, `updatedAt` | Threaded comments and replies. |
| `Review` | `engageable_reviews` | `id`, `target_id`, `target_type`, `userId`, `text`, `rating`, `createdAt`, `updatedAt` | Reviews with 0.0–5.0 star ratings. |
| `EngagementAction` | `engagement_actions` | `id`, `target_id`, `target_type`, `userId`, `type`, `metadata`, `createdAt`, `updatedAt` | Social actions (`repost`, `bookmark`, `share`, `follow`). |

All tables extend `BaseEntity` which includes standard UUID primary keys and timestamps (`createdAt`, `updatedAt`).

---

## License & Contributing

Distributed under the **MIT License**. See `LICENSE` for more information.

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/IsaiahTek/engageable/issues).

Developed with ❤️ by **[Engr. Isaiah Pius E.](mailto:isaiahtech1@gmail.com)**.