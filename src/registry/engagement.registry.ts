import { EngagementActionType } from '../interfaces/user_entity.type';

// engagement.registry.ts
export class EngagementRegistry {
  private static registry = new Map<string, any>();

  private static actions: EngagementActionType[] =
    Object.values(EngagementActionType);

  private static otherInternalEngageables = ['comment', 'like'];

  static register(typeName: string, entity?: any) {
    this.registry.set(typeName.toLowerCase(), entity ?? typeName);
  }

  static get(typeName: string) {
    return this.registry.get(typeName.toLowerCase());
  }

  static isRegisteredByEntity(entity: any): boolean {
    const name = entity.name?.toLowerCase?.();
    return !!this.registry.get(name);
  }

  static isRegisteredByTypeName(typeName: string): boolean {
    return !!this.registry.get(typeName.toLowerCase());
  }

  static list(): string[] {
    return Array.from(this.registry.keys());
  }

  static getRootList(): string[] {
    return Array.from(this.registry.keys()).filter(
      (key) =>
        !this.actions.includes(key as EngagementActionType) &&
        !this.otherInternalEngageables.includes(key),
    );
  }
}
