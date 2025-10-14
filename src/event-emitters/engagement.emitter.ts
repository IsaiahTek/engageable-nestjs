import { Inject, Injectable } from '@nestjs/common';
import { EngagementEvent } from '../utils/enums';
import { EngagementOptionsKey } from '../utils/constants';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EngagementOptions } from '../interfaces/engagement-options.interface';

@Injectable()
export class EngagementEmitter {
  constructor(
    @Inject(EngagementOptionsKey) private options: EngagementOptions,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  public emit(event: EngagementEvent, data: any): void {
    if (this.options.emitEvents) {
      this.eventEmitter.emit(event, JSON.stringify(data));
    }
  }
}
