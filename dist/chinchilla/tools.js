"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("superagent");
const lodash_1 = require("lodash");
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
                .set({ "Accept-Encoding": "gzip,deflate" });
        }
        else {
            return request;
        }
    }
    static errorResult(err, res) {
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
            error['statusCode'] = 500;
            error['statusText'] = 'No response returned';
        }
        return error;
    }
}
exports.Tools = Tools;
