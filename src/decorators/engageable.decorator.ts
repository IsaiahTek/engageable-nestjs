import { EngagementRegistry } from '../registry/engagement.registry';

export const ENGAGEABLE_METADATA_KEY = 'engageableType';

export function Engageable(typeName?: string): ClassDecorator {
  return (target) => {
    const name = typeName || target.name.toLowerCase();
    Reflect.defineMetadata(ENGAGEABLE_METADATA_KEY, name, target);
    EngagementRegistry.register(name, target.name); // <— new addition
  };
}
