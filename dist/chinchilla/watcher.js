"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
let actions = [];
let listeners = [];
const next = () => {
    const cb = listeners.pop();
    cb && lodash_1.delay(cb, 100);
};
exports.Watcher = {
    actions: actions,
    listeners: listeners,
    start: (id) => {
        actions = lodash_1.concat(actions, id);
    },
    complete: (id) => {
        actions = lodash_1.without(actions, id);
        if (actions.length === 0)
            next();
    },
    performLater: (cb) => {
        lodash_1.delay(() => {
            listeners.push(cb);
            if (actions.length === 0)
                next();
        }, 100);
    }
};
