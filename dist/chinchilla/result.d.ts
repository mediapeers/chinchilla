import { Config } from './config';
export declare class Result {
    static paginationProps: string[];
    type: string;
    headers: any;
    aggregations: any;
    body: any;
    options: any;
    objects: any[];
    pagination: any;
    success(result: any, config: Config, options?: any): void;
    readonly object: any;
}
