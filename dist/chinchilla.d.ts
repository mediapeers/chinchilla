import { Subject } from './chinchilla/subject';
import { Config, Cookies, NoCookies } from './chinchilla/config';
import { Cache, NoCache } from './chinchilla/cache';
import { Extractor } from './chinchilla/extractor';
declare const chch: ((one: any, two?: string | Config, three?: Config) => Subject) & {
    config: Config;
    cache: Cache;
    cookies: typeof Cookies;
    watcher: {
        actions: string[];
        listeners: Function[];
        start: (id: any) => void;
        complete: (id: any) => void;
        performLater: (cb: any) => void;
    };
    extractor: typeof Extractor;
    new: (app: any, model: any, attrs?: {}, config?: Config) => any;
    contextUrl: (app: any, model: any, config?: Config) => string;
    context: (urlOrApp: any, model?: string, config?: Config) => any;
    unfurl: (app: any, model: any, actionName: any, params: any) => any;
};
export { NoCache, NoCookies };
export default chch;
