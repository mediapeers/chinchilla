export declare class Cookies {
    static get(...args: any[]): any;
    static set(...args: any[]): any;
    static expire(...args: any[]): any;
}
<<<<<<< HEAD
export interface Settings {
    endpoints: any;
    cookieTimeout: number;
    timestamp: number;
    domain?: string;
    devMode?: boolean;
    errorInterceptor?: Function;
=======
export declare class NoCookies {
    static get(...args: any[]): void;
    static set(...args: any[]): void;
    static expire(...args: any[]): void;
>>>>>>> c3b48ca... adds empty cookies and cache implementations to be used optionally
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
