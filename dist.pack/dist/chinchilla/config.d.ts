export declare class Cookies {
    static get(...args: any[]): any;
    static set(...args: any[]): any;
    static expire(...args: any[]): any;
}
export declare class Config {
    static endpoints: {};
    static timestamp: number;
    static domain: string;
    static errorInterceptor: any;
    static setEndpoint(name: string, url: string): void;
    static setCookieDomain(domain: string): void;
    static setErrorInterceptor(fn: any): void;
    static setAffiliationId(id: string): void;
    static getAffiliationId(): string;
    static clearAffiliationId(): void;
    static setSessionId(id: string): void;
    static getSessionId(): string;
    static clearSessionId(): void;
    static getValue(name: any): string;
    static setValue(name: any, value: any): void;
    static clearValue(name: any): void;
    static cookieKey(name: any): string;
}
