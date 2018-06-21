import * as UriTemplate from 'uri-templates';
import * as Promise from 'bluebird';
import { Result } from './result';
import { ContextAction } from './context';
export declare class Action {
    ready: Promise<Result>;
    params: Object;
    options: any;
    body: Object;
    uriTmpl: UriTemplate;
    contextAction: ContextAction;
    result: Result;
    constructor(contextAction: ContextAction, params: {}, body: any, options?: any);
    private formatBody(data);
    private remapAttributes(object);
}
