export declare class EngagementRegistry {
    private static registry;
    private static actions;
    private static otherInternalEngageables;
    static register(typeName: string, entity?: any): void;
    static get(typeName: string): any;
    static isRegisteredByEntity(entity: any): boolean;
    static isRegisteredByTypeName(typeName: string): boolean;
    static list(): string[];
    static getRootList(): string[];
}
