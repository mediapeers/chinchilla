export interface ICookies {
    get: Function;
    set: Function;
    expire: Function;
}
export declare class NoCookies implements ICookies {
    get(..._args: any[]): void;
    set(..._args: any[]): void;
    expire(..._args: any[]): void;
}
export declare class Cookies implements ICookies {
    get(...args: any[]): any;
    set(...args: any[]): any;
    expire(...args: any[]): any;
}
export interface Settings {
    endpoints: any;
    cookieTimeout: number;
    timestamp: number;
    domain?: string;
    devMode?: boolean;
    errorInterceptor?: Function;
}
export declare class Config {
    getAffiliationId: Function;
    setAffiliationId: Function;
    clearAffiliationId: Function;
    getRoleId: Function;
    setRoleId: Function;
    clearRoleId: Function;
    getSessionId: Function;
    setSessionId: Function;
    clearSessionId: Function;
    getFlavours: Function;
    setFlavours: Function;
    clearFlavours: Function;
    settings: Settings;
    cookies: ICookies;
    static _instance: Config;
    static readonly instance: Config;
    constructor(settings?: {});
    initGetSet(): void;
    clone(): Config;
    setEndpoint(name: string, url: string): void;
    setCookieDomain(domain: string): void;
    setErrorInterceptor(fn: any): void;
    getValue(name: any): string;
    updateCacheKey(): void;
    getCacheKey(suffix?: string): string;
    setValue(name: any, value: any): void;
    clearValue(name: any): void;
    clear(): void;
    cookieKey(name: any): string;
    setFlavour(name: any, value: any): any;
    readonly activeFlavours: any;
}
