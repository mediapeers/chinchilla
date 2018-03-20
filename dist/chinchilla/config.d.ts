export declare class Cookies {
    static get(...args: any[]): any;
    static set(...args: any[]): any;
    static expire(...args: any[]): any;
}
export declare class Config {
    static endpoints: {};
    static domain: string;
    static errorInterceptor: any;
    static cookieTimeout: number;
    static timestamp: number;
    static getAffiliationId: Function;
    static getRoleId: Function;
    static getSessionId: Function;
    static getCacheKey: Function;
    static setFlavours: Function;
    static getFlavours: Function;
    static setEndpoint(name: string, url: string): void;
    static setCookieDomain(domain: string): void;
    static setErrorInterceptor(fn: any): void;
    static getValue(name: any): string;
    static updateCacheKey(): void;
    static setValue(name: any, value: any): void;
    static clearValue(name: any): void;
    static cookieKey(name: any): string;
    static setFlavour(name: any, value: any): any;
    static readonly activeFlavours: any;
}
