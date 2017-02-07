export declare class Config {
    static endpoints: {};
    static timestamp: number;
    static domain: string;
    static sessionId: string;
    static sessionKey: string;
    static errorInterceptor: any;
    static setEndpoint(name: string, url: string): void;
    static setCookieDomain(domain: string): void;
    static setSessionId(id: string): void;
    static setErrorInterceptor(fn: any): void;
    static getSessionId(): string;
    static clearSessionId(): void;
}
