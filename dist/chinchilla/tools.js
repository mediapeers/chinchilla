"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("superagent");
const lodash_1 = require("lodash");
const cache_1 = require("./cache");
//import * as sdebug from 'superdebug'
//import * as http from 'http'
class Tools {
    static get isNode() {
        return typeof window === 'undefined';
    }
    static get req() {
        if (Tools.isNode) {
            //const agent = new http.Agent()
            //agent.maxSockets = 100
            return request
                .agent()
                //.use(sdebug(console.info))
                .set({ "Accept-Encoding": "gzip,deflate" });
        }
        else {
            return request;
        }
    }
    static handleError(err, res, config) {
        var error = new Error(lodash_1.get(res, 'body.description') || lodash_1.get(err, 'response.statusText') || 'No error details available');
        if (res) {
            error['headers'] = res.headers;
            error['object'] = res.body;
            error['statusCode'] = res.statusCode;
            error['statusText'] = res.statusText;
            error['url'] = res.req.url;
            error['method'] = res.req.method;
            error['stack'] = err.stack;
        }
        else {
            const errMsg = lodash_1.result(err, 'toString');
            // assuming maintenance on terminated request.. (causing preflights to fail with empty response)
            error['statusCode'] = errMsg && errMsg.match(/terminated/i) ? 418 : 500;
            error['statusText'] = errMsg || 'Unknown error';
        }
        // session timed out, reset cookies and caches
        if (error['statusCode'] === 419) {
            cache_1.Cache.clear();
            config.clear();
        }
        if (config.settings.errorInterceptor) {
            if (config.settings.errorInterceptor(error))
                return [true, error];
        }
        return [false, error];
    }
}
exports.Tools = Tools;
