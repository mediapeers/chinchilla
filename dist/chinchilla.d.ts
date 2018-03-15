import { Subject } from './chinchilla/subject';
<<<<<<< HEAD
import { Config, Cookies } from './chinchilla/config';
import { Cache } from './chinchilla/cache';
import { Extractor } from './chinchilla/extractor';
declare const chch: ((one: any, two?: string | Config, three?: Config) => Subject) & {
    config: Config;
    cookies: typeof Cookies;
    cache: typeof Cache;
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
=======
import { NoCookies } from './chinchilla/config';
import { NoCache } from './chinchilla/cache';
declare let chch: (objectsOrApp: any, model?: any) => Subject;
export { NoCache, NoCookies };
>>>>>>> c3b48ca... adds empty cookies and cache implementations to be used optionally
export default chch;
