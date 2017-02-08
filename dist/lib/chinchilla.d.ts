import { Subject } from './chinchilla/subject';
import { Config } from './chinchilla/config';
import { Context } from './chinchilla/context';
export default class chch {
    static subject(objectsOrApp: any, model?: any): Subject;
    static config: typeof Config;
    static new(app: any, model: any, attrs?: {}): any;
    static contextUrl(app: any, model: any): string;
    static context(urlOrApp: any, model: any): Promise<Context>;
    static unfurl: (app: any, model: any, actionName: any, params: any) => Promise<{}>;
}
