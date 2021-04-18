/**
 * Created by jim on 6/22/2017.
 */
import http from 'http'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { handleResp, promiseOrCallback } from './tools/util'
import User from './models/user'

passport.use(new LocalStrategy((username, password, done) => {
    if (!username || !password) {
        return done(null, false, { message: '用户名或密码错误' })
    }
    User.findOne({ username: new RegExp(`^${username}$`, 'i'), status: 0 }, async (err, user) => {
        if (err) { return done(err) }
        if (!user) {
            return done(null, false, { message: '用户不存在' })
        }
        if (!user.authenticate(password)) {
            user.errorTimes++
            await user.save()
            return done(null, false, { message: '密码错误' })
        }
        if (user.errorTimes !== 0) {
            user.errorTimes = 0
            await user.save()
        }
        return done(null, user)
    })
}
))

passport.serializeUser(function (user, done) {
    done(null, user.id)
})

// Deserialize sessions
passport.deserializeUser(function (id, done) {
    User.findOne({
        _id: id,
        status: 0
    }, '-password', function (err, user) {
        done(err, user)
    })
})

let rewriteFun = false

export function initPassport () {
    return [
        passport.initialize(),
        passport.session(),
        (req, res, next) => {
            if (!rewriteFun) {
                rewriteFun = true
                http.IncomingMessage.prototype.login = promiseOrCallback(http.IncomingMessage.prototype.login)
            }
            next()
        }
    ]
}

export function authenticateLocal (req, res, next) {
    return new Promise((resolve, reject) => {
        passport.authenticate('local', (err, user, info) => {
            if (err || !user) {
                reject(err || new Error(info.message))
            } else {
                resolve(user)
            }
        })(req, res, next)
    })
}

export default function auth (req, res, next) {
    if (req.user) return next()
    handleResp(res, Promise.reject(new Error('User is not signed in')))
}
