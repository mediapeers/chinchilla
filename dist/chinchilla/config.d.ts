export declare class Cookies {
    static get(...args: any[]): any;
    static set(...args: any[]): any;
    static expire(...args: any[]): any;
}
export declare class NoCookies {
    static get(..._args: any[]): void;
    static set(..._args: any[]): void;
    static expire(..._args: any[]): void;
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
    cookiesImpl: typeof Cookies;
    static instance: Config;
    static getInstance(): Config;
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
