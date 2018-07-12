import { Config } from './config';
export declare class Tools {
    static readonly isNode: boolean;
    static readonly req: any;
    static handleError(err: any, res: any, config: Config): (boolean | Error)[];
}
