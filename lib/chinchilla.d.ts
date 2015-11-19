declare var _: any;
declare var Promise: any;
declare module Chinchilla {
    class Session {
        private static _instance;
        constructor();
        static getInstance(): Session;
        getSessionId(): string;
    }
}
