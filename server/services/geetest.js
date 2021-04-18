
/**
 * 极致验证码
 */
import Geetest from 'gt3-sdk'
import { promiseOrCallback } from '../tools/util'

const captcha = new Geetest({
    geetest_id: '5c42e3a21e048de17c6a1b0214831650',
    geetest_key: '8f1d7a19e2d5a37babe8d533f3501c21'
})

export const register = promiseOrCallback(captcha.register, captcha)

export const validate = promiseOrCallback(captcha.validate, captcha)
