import { Subject } from './chinchilla/subject';
import { Config } from './chinchilla/config';
import { Cache } from './chinchilla/cache';
import { Extractor } from './chinchilla/extractor';
declare const chch: ((one: any, two?: string | Config, three?: Config) => Subject) & {
    config: Config;
    cache: typeof Cache;
    extractor: typeof Extractor;
    new: (app: any, model: any, attrs?: {}, config?: Config) => any;
    contextUrl: (app: any, model: any, config?: Config) => string;
    context: (urlOrApp: any, model?: string, config?: Config) => any;
    unfurl: (app: any, model: any, actionName: any, params: any) => any;
};
export default chch;
