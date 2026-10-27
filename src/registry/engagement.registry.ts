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
    const lower = typeName?.toLowerCase?.();
    if (this.otherInternalEngageables.includes(lower)) return true;
    return !!this.registry.get(lower);
  }

  static list(): string[] {
    const all = new Set([...this.registry.keys(), ...this.otherInternalEngageables]);
    return Array.from(all);
  }

  static getRootList(): string[] {
    return Array.from(this.registry.keys()).filter(
      (key) =>
        !this.actions.includes(key as EngagementActionType) &&
        !this.otherInternalEngageables.includes(key),
    );
  }
}
