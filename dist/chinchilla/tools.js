"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("superagent");
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
}
exports.Tools = Tools;
