export declare class Cache {
    private static cacheSize;
    private static cacheOrder;
    private static cache;
    static generateKey(type: string): string;
    static add(key: string, obj: any): void;
    static get(key: string): any;
    static clear(): void;
    private static capCache();
    private static sliceCache(arr, size);
}
