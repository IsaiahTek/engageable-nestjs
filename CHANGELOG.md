# Changelog

All notable changes to `engageable-nestjs` will be documented in this file.

## [1.1.0] - 2026-10-29

### Fixed
- **countActions route param bug**: Fixed the route parameter concatenation (`:action' + 's'`) in `EngagementController` that caused Express to register `:actions` while Nest injected `:action` as `undefined`. Both singular (`/action/:action`) and plural (`/actions/:action`) routes and parameter forms are now supported and normalized.
- **Action enum validation**: Added parameter validation in `EngagementController` for generic actions (`bookmark`, `repost`, `share`, `follow`), returning `400 Bad Request` instead of letting Postgres throw a `500 Internal Server Error` on invalid action types.
- **registerUserRelation idempotency**: Added relation and join column duplicate checks in `registerUserRelation` to prevent pushing duplicate metadata args into TypeORM when invoked across multiple config/module files.
- **Review summary scalability**: Replaced in-memory review entity loading in `ReviewService.getReviewSummary` with high-performance SQL aggregations (`COUNT(*)`, `AVG(rating)`, and `FLOOR(rating)` distribution grouping).

### Added
- **Public exports in index.ts**: Exported `EngagementController`, `registerUserRelation`, `EngagementRegistry`, `@IsHalfStep()`, `CommentDto`, `ReviewDto`, `DefaultEngagementAuthGuard`, and `EngagementEmitter` to eliminate brittle deep imports.
- **Optional Swagger support**: Implemented a safe fallback wrapper for `@nestjs/swagger` decorators (`ApiTags`, `ApiProperty`, `ApiPropertyOptional`, `ApiQuery`) so applications without Swagger installed will not crash on startup. Added `@nestjs/swagger` as an optional peer dependency, and added `class-validator` and `class-transformer` to peer dependencies.
- **Standardized schema column names**: Ensured consistent `user_id`, `target_id`, and `target_type` column mappings across all entities (`Like`, `Comment`, `Review`, `EngagementAction`).
- **Release hygiene**: Added `files` manifest to `package.json`, cleaned up local workspace scripts, and added `LICENSE` file.

---

## [1.0.2]

- Added `/likes` endpoint to controller to inspect all likes.