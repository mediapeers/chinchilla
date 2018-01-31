'use strict'

import * as Promise from 'bluebird'
import * as Cookies from 'cookies-js'
import * as UriTemplate from 'uri-templates'
import * as request from 'superagent'
import * as storage from 'localstorage-ponyfill'
import chch from './chinchilla'

window['Promise']     = Promise
window['Cookies']     = Cookies
window['UriTemplate'] = UriTemplate
window['request']     = request
window['storage']     = storage
window['chch']        = chch
