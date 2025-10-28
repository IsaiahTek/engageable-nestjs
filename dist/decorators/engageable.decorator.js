"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENGAGEABLE_METADATA_KEY = void 0;
exports.Engageable = Engageable;
const engagement_registry_1 = require("../registry/engagement.registry");
exports.ENGAGEABLE_METADATA_KEY = 'engageableType';
function Engageable(typeName) {
    return (target) => {
        const name = typeName || target.name.toLowerCase();
        Reflect.defineMetadata(exports.ENGAGEABLE_METADATA_KEY, name, target);
        engagement_registry_1.EngagementRegistry.register(name, target.name);
    };
}
//# sourceMappingURL=engageable.decorator.js.map