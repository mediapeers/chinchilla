'use strict'

import * as Promise from 'bluebird'
import * as Cookies from 'cookies-js'

window['Promise'] = Promise
window['Cookies'] = Cookies

import chch from './chinchilla'

window['chch'] = chch.subject
window['chch'].new = chch.new
window['chch'].context = chch.context
window['chch'].config = chch.config
window['chch'].contextUrl = chch.contextUrl
window['chch'].unfurl = chch.unfurl
