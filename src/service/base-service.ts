import { Inject } from '@nestjs/common';
import { EngagementOptions } from '../interfaces/engagement-options.interface';
import { UserEntityKey, EngagementOptionsKey } from '../utils/constants';

export class BaseService {
  constructor(
    @Inject(UserEntityKey)
    protected readonly userEntity: any,
    @Inject(EngagementOptionsKey)
    protected options: EngagementOptions,
  ) {}
}
