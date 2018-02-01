export declare abstract class BaseCache {
    protected storage: any;
    abstract getValue(extkey: string): any;
    abstract setValue(extkey: string, val: any): any;
    abstract removeValue(extkey: string): any;
    abstract clear(): any;
    set(key: string, val: any, expires?: number): void;
    get(key: string): any;
    extkey(suffix: string): string;
    minutesFromNow(min: number): number;
}
export declare class RuntimeCache extends BaseCache {
    constructor();
    setValue(extkey: string, val: any): void;
    getValue(extkey: string): any;
    removeValue(extkey: string): void;
    clear(): void;
}
export declare class StorageCache extends BaseCache {
    constructor();
    setValue(extkey: string, val: any): void;
    getValue(extkey: string): any;
    removeValue(extkey: string): void;
    clear(): void;
}
export declare class Cache {
    private static _storage;
    private static _runtime;
    static clear(): void;
    static random(prefix?: string): string;
    static readonly storage: any;
    static readonly runtime: any;
}
