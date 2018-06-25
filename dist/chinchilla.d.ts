import { Subject } from './chinchilla/subject';
import { Config } from './chinchilla/config';
import { Cache } from './chinchilla/cache';
import { Extractor } from './chinchilla/extractor';
declare const chch: ((objectsOrApp: any, model?: any) => Subject) & {
    config: typeof Config;
    cache: typeof Cache;
    extractor: typeof Extractor;
    new: (app: any, model: any, attrs?: {}) => any;
    contextUrl: (app: any, model: any) => string;
    context: (urlOrApp: any, model: any) => any;
    unfurl: (app: any, model: any, actionName: any, params: any) => any;
};
export default chch;
