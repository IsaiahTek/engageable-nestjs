// engagement.service.ts
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { EngagementTarget } from '../entities/engagement-target.entity';
import { EngagementOptionsKey, UserEntityKey } from '../utils/constants';
import { EngagementOptions } from '../interfaces/engagement-options.interface';
import { EngagementEmitter } from '../event-emitters/engagement.emitter';
import { EngagementEvent } from '../utils/enums';
import { EngagementRegistry } from '../registry/engagement.registry';

@Injectable()
export class EngagementService {
  constructor(
    @InjectDataSource() protected readonly dataSource: DataSource,
    @InjectRepository(EngagementTarget)
    protected targetRepo: Repository<EngagementTarget>,
    @Inject(UserEntityKey) protected readonly userEntity: any,
    @Inject(EngagementOptionsKey) protected options: EngagementOptions,
    protected readonly engagementEmitter: EngagementEmitter,
  ) {}

  get hasUserSupport(): boolean {
    return !!this.userEntity;
  }

  async ensureTarget(targetType: string, targetId: string) {
    // Step 1: Check if engagement target already exists
    let target = await this.targetRepo.findOne({
      where: { targetType, targetId },
    });
    if (target) return target;

    console.log(
      '🚀 ~ file: engagement.service.ts:66 ~ EngagementService ~ ensureTarget ~ target',
      target,
    );

    // Step 2: Try to resolve the real entity type from metadata
    const registryEntry = Object.values(this.dataSource.entityMetadatas).find(
      (meta) => meta.name.toLowerCase() === targetType.toLowerCase(),
    );

    if (!registryEntry) {
      throw new Error(`Unknown engageable type: ${targetType}`);
    }

    // Step 3: Confirm the actual entity exists
    const entityRepo = this.dataSource.getRepository(registryEntry.target);
    const entity = await entityRepo.findOne({ where: { id: targetId } });

    if (!entity) {
      throw new NotFoundException(
        `${targetType} with ID '${targetId}' does not exist. Cannot create engagement target.`,
      );
    }

    // Step 4: Create the engagement target (since entity exists)
    target = this.targetRepo.create({ targetType, targetId });
    await this.targetRepo.save(target);

    // Step 5: Lazy link engagementTarget back to parent entity (if property exists)
    if ('engagementTarget' in entity) {
      entity.engagementTarget = target;
      await entityRepo.save(entity);
    }

    // Step 6: Emit target creation event (optional)
    this.engagementEmitter.emit(EngagementEvent.TARGET_CREATED, { target });

    return target;
  }

  async deleteTarget(targetType: string, targetId: string) {
    const target = await this.targetRepo.findOne({
      where: { targetType, targetId },
    });
    if (!target) throw new NotFoundException('Target not found');
    return this.targetRepo.remove(target);
  }

  async getTarget(targetType: string, targetId: string) {
    return this.targetRepo.findOne({
      where: { targetType, targetId },
      relations: ['likes', 'comments'],
    });
  }

  // engagement.service.ts
  async getTargets(): Promise<any[]> {
    const ROOT_TYPES = EngagementRegistry.getRootList();

    // Fetch all engagements
    const allEngagements = await this.targetRepo.find({
      where: {},
      relations: [
        'likes',
        'comments',
        'comments.likes',
        'comments.user',
        'actions',
      ],
      order: { createdAt: 'DESC' },
    });

    // Separate root and internal engagements
    const rootTargets = allEngagements.filter((e) =>
      ROOT_TYPES.includes(e.targetType),
    );
    const internalTargets = allEngagements.filter(
      (e) => !ROOT_TYPES.includes(e.targetType),
    );

    // Create a quick lookup map for internal engagements by targetType+targetId
    const internalMap = new Map<string, EngagementTarget>();
    for (const eng of internalTargets) {
      internalMap.set(`${eng.targetType}:${eng.targetId}`, eng);
    }

    // Attach nested engagement data to comments inside each root target
    for (const root of rootTargets) {
      for (const comment of root.comments) {
        const commentEngagement = internalMap.get(`comment:${comment.id}`);
        if (commentEngagement) {
          comment.likes = commentEngagement.likes ?? [];
          comment.replies = commentEngagement.comments ?? [];
        } else {
          comment.likes = [];
          comment.replies = [];
        }
      }
    }

    return rootTargets;
  }

  async deleteTargets() {
    const targets = await this.targetRepo.find();

    for (const target of targets) {
      const typeName = target.targetType.toLowerCase();

      // Check if the targetType is registered in the engagement registry
      if (EngagementRegistry.isRegisteredByTypeName(typeName)) {
        const registeredEntity = EngagementRegistry.get(typeName);

        if (registeredEntity) {
          try {
            // Get the repository dynamically
            const entityRepo = this.dataSource.getRepository(registeredEntity);

            // Ensure the entity actually exists before unlinking
            const entity = await entityRepo.findOne({
              where: { id: target.targetId },
            });

            if (entity && 'engagementTarget' in entity) {
              // Safely remove linkage to prevent cascading deletions
              await this.dataSource
                .createQueryBuilder()
                .relation(registeredEntity, 'engagementTarget')
                .of(entity)
                .set(null);
            }
          } catch (err) {
            console.warn(
              `⚠️ Failed to unlink ${typeName} (${target.targetId}): ${(err as Error).message}`,
            );
          }
        }
      }
    }

    // ✅ Now safely delete all engagement targets
    return this.targetRepo.delete({});
  }
}
