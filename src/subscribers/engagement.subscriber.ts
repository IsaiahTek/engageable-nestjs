// src/subscribers/engagement.subscriber.ts
import { DataSource, EntitySubscriberInterface, InsertEvent } from 'typeorm';
import { Injectable, Inject } from '@nestjs/common';
import { EngagementTarget } from '../entities/engagement-target.entity';
// import { ENGAGEABLE_METADATA_KEY } from '../decorators/engageable.decorator';
import { EngagementOptions } from '../interfaces/engagement-options.interface';
import { EngagementOptionsKey } from '../utils/constants';
import { InjectDataSource } from '@nestjs/typeorm';
import { EngagementRegistry } from '../registry/engagement.registry';
import { EngagementEmitter } from '../event-emitters/engagement.emitter';
import { EngagementEvent } from '../utils/enums';

@Injectable()
export class EngagementSubscriber implements EntitySubscriberInterface<any> {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @Inject(EngagementOptionsKey) private options: EngagementOptions,
    private readonly engagementEmitter: EngagementEmitter,
  ) {
    this.dataSource.subscribers.push(this);
  }

  async afterInsert(event: InsertEvent<any>) {
    // // Skip if autoCreateTargets is disabled
    // if (!this.options.autoCreateTargets) return;

    // const metadata = Reflect.getMetadata(
    //   ENGAGEABLE_METADATA_KEY,
    //   event.metadata.target,
    // );
    // if (!metadata) return; // entity is not @Engageable

    // const targetRepo = event.manager.getRepository(EngagementTarget);
    // const exists = await targetRepo.findOne({
    //   where: { targetType: metadata, targetId: event.entity.id },
    // });
    // if (!exists) {
    //   const newTarget = targetRepo.create({
    //     targetType: metadata,
    //     targetId: event.entity.id,
    //   });
    //   await targetRepo.save(newTarget);
    // }
    const targetType = EngagementRegistry.get(event.metadata.targetName);
    if (!targetType) return; // Not an engageable entity

    const targetRepo = event.manager.getRepository(EngagementTarget);
    let target = await targetRepo.findOne({
      where: { targetType, targetId: event.entity.id },
    });

    if (!target && this.options.autoCreateTargets) {
      target = targetRepo.create({ targetType, targetId: event.entity.id });
      await targetRepo.save(target);

      // Link back to entity
      if ('engagementTarget' in event.entity) {
        event.entity.engagementTarget = target;
        await event.manager.save(event.entity);
        this.engagementEmitter.emit(EngagementEvent.TARGET_CREATED, target);
      }
    }
  }
}
