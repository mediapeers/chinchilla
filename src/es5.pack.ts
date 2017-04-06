'use strict'

import * as Promise from 'bluebird'
import * as Cookies from 'cookies-js'
import * as UriTemplate from 'uri-templates'
import chch from './chinchilla'

window['Promise']     = Promise
window['Cookies']     = Cookies
window['UriTemplate'] = UriTemplate
window['chch']        = chch
