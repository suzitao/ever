import logger from './tools/log'
import log4js from 'log4js'
import { Nuxt, Builder } from 'nuxt'
import express from 'express'
import mongoose from 'mongoose'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import ConnectRedis from 'connect-redis'
import bluebird from 'bluebird'

import client from './tools/redis'
import { initPassport } from './passport'
import { wrap } from './tools/util'

import userConfig from '../config'

import api from './api'

import { startSchedule } from './services/schedule'

const RedisStore = ConnectRedis(session)

mongoose.Promise = bluebird

console.log('EVERFAST_ENV', process.env.EVERFAST_ENV)
console.log('NODE_ENV', process.env.NODE_ENV)

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise ', p, ' reason: ', reason)
})

const app = express()
const router = express.Router()
const host = process.env.HOST || '0.0.0.0'
const port = process.env.PORT || 3000
const isDev = process.env.NODE_ENV !== 'production'

app.use(log4js.connectLogger(logger, { level: 'auto', format: ':method :url' }))

app.set('port', port)
app.set('trust proxy', 1)

mongoose.connect(userConfig.db.uri, userConfig.db.options)

router.use(
    (req, res, next) => {
        if (req.method === 'GET' && (/^\/_/.exec(req.originalUrl) ||
            /\.(js|css|icon|png|jpg|jpeg|woff|ico)/.exec(req.originalUrl))) {
            return next('router')
        }
        next()
    },
    bodyParser.urlencoded({
        extended: true
    }),
    bodyParser.json(),
    cookieParser(),
    session({
        saveUninitialized: false,
        resave: false,
        rolling: true,
        secret: userConfig.session.secret,
        store: new RedisStore({ client }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 10 // 4小时过期
        }
    }),
    initPassport()
)
router.use('/api',
    morgan(isDev ? 'dev' : 'short'),
    api, wrap(async req => {
        throw new Error('不存在的接口路径: ' + req.url)
    })
)

app.use(router)

// Start nuxt.js
async function start () {
    // Import and Set Nuxt.js options
    let config = require('../nuxt.config.js')
    config.dev = isDev
    // Instanciate nuxt.js
    const nuxt = new Nuxt(config)

    if (config.dev) {
        const builder = new Builder(nuxt)
        builder.build()
    }
    // Add nuxt.js middleware
    app.use(nuxt.render)
    // Listen the server
    app.listen(port, host).timeout = 5 * 60 * 1000
    console.log('Server listening on ' + host + ':' + port) // eslint-disable-line no-console
}

start()
if (process.env.EVERFAST_ENV === 'production') startSchedule()
