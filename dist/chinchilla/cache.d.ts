export declare abstract class BaseCache {
    protected storage: any;
    abstract getValue(extkey: string): any;
    abstract setValue(extkey: string, val: any): any;
    abstract removeValue(extkey: string): any;
    abstract clear(): any;
    put(extkey: string, val: any, expires?: number): void;
    fetch(extkey: string): any;
    drop(extkey: string): void;
    change(extkey: any, fn?: any, defaultValue?: any, expires?: number): void;
    set(key: string, val: any, expires?: number): void;
    get(key: string): any;
    remove(key: string): void;
    update(key: string, fn?: any, defaultValue?: any, expires?: number): void;
    minutesFromNow(min: number): number;
}
export declare class NoCache extends BaseCache {
    setValue(..._args: any[]): void;
    removeValue(..._args: any[]): void;
    clear(..._args: any[]): void;
    getValue(..._args: any[]): void;
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
    storage: BaseCache;
    runtime: BaseCache;
    static _instance: Cache;
    constructor();
    clear(): void;
    random(prefix?: string): string;
    static readonly instance: Cache;
}
