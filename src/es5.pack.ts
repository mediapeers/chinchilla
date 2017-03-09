'use strict'

import * as Promise from 'bluebird'
import * as Cookies from 'cookies-js'
import chch from './chinchilla'

window['Promise'] = Promise
window['Cookies'] = Cookies
window['chch']    = chch
