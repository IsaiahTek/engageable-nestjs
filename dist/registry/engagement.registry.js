"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngagementRegistry = void 0;
const user_entity_type_1 = require("../interfaces/user_entity.type");
class EngagementRegistry {
    static register(typeName, entity) {
        this.registry.set(typeName.toLowerCase(), entity ?? typeName);
    }
    static get(typeName) {
        return this.registry.get(typeName.toLowerCase());
    }
    static isRegisteredByEntity(entity) {
        const name = entity.name?.toLowerCase?.();
        return !!this.registry.get(name);
    }
    static isRegisteredByTypeName(typeName) {
        return !!this.registry.get(typeName.toLowerCase());
    }
    static list() {
        return Array.from(this.registry.keys());
    }
    static getRootList() {
        return Array.from(this.registry.keys()).filter((key) => !this.actions.includes(key) &&
            !this.otherInternalEngageables.includes(key));
    }
}
exports.EngagementRegistry = EngagementRegistry;
EngagementRegistry.registry = new Map();
EngagementRegistry.actions = Object.values(user_entity_type_1.EngagementActionType);
EngagementRegistry.otherInternalEngageables = ['comment', 'like'];
//# sourceMappingURL=engagement.registry.js.map