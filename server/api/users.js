import { Router } from 'express'
import { wrap, rand, extendByKey } from '../tools/util'
import { authenticateLocal } from '../passport'
import User from '../models/user'
import { BMP24 } from 'gd-bmp'
import * as geetest from '../services/geetest'

const router = Router()

router.get('/users/isExist/username', wrap(async (req, res) => {
    let user
    if (req.query.id) {
        user = await User.findOne({ usernameLowerCase: req.query.username.toLowerCase(), _id: {$ne: req.query.id} })
    } else {
        user = await User.findOne({ usernameLowerCase: req.query.username.toLowerCase() })
    }
    if (user) {
        return true
    } else {
        return false
    }
}))

router.get('/users/isExist/email', wrap(async (req, res) => {
    let user
    if (req.query.id) {
        user = await User.findOne({ email: req.query.email, _id: {$ne: req.query.id} })
    } else {
        user = await User.findOne({ email: req.query.email })
    }
    if (user) {
        return true
    } else {
        return false
    }
}))

router.get('/users/isExist/cellphoneNumber', wrap(async (req, res) => {
    let user
    if (req.query.id) {
        user = await User.findOne({ cellphoneNumber: req.query.cellphoneNumber, _id: {$ne: req.query.id} })
    } else {
        user = await User.findOne({ cellphoneNumber: req.query.cellphoneNumber })
    }
    if (user) {
        return true
    } else {
        return false
    }
}))

router.get('/users/isNeedCaptcha', wrap(async (req, res) => {
    const user = await User.findOne({ username: new RegExp(`^${req.query.username}$`, 'i'), status: 0 })
    return user && user.errorTimes >= 3
}))

// 用户注册
router.post('/users/register', wrap(async (req, res, next) => {
    req.body.usernameLowerCase = req.body.username.toLowerCase()
    // const user = await User.findOne({ usernameLowerCase: req.body.username.toLowerCase() })
    // if (user) {
    //     throw new Error('用户名已存在')
    // }
    await new User(extendByKey({}, req.body, ['username', 'password', 'realname', 'cellphoneNumber', 'email', 'usernameLowerCase'])).save()
}))

// 用户登录
router.post('/users/login', wrap(async (req, res, next) => {
    // const capcha = req.body.capcha || ''
    // const scapcha = req.session.capcha || '-'
    // if (!req.body.capcha || capcha.toLocaleLowerCase() !== scapcha.toLocaleLowerCase()) {
    //     throw new Error('验证码不正确')
    // }
    console.log('user login', req.body.username, req.body.password)
    req.body.usernameLowerCase = req.body.username.toLowerCase()
    let user = await User.findOne({ username: new RegExp(`^${req.body.username}$`, 'i'), status: 0, isAdmin: false })
    if (!user || user.isAdmin) {
        throw new Error('用户不存在')
    }
    if (user.errorTimes >= 3) {
        const success = await geetest.validate(req.session.fallback, {
            geetest_challenge: req.body.geetest_challenge,
            geetest_validate: req.body.geetest_validate,
            geetest_seccode: req.body.geetest_seccode
        })
        if (!success) {
            throw new Error('验证码不正确')
        }
    }
    user = await authenticateLocal(req, res, next)
    user.password = undefined
    await req.login(user)
    return user
}))

// 管理员登录
router.post('/admin/login', wrap(async (req, res, next) => {
    console.log('admin login', req.body.username, req.body.password)
    req.body.usernameLowerCase = req.body.username.toLowerCase()
    const user = await authenticateLocal(req, res, next)
    if (!user || !user.isAdmin) {
        throw new Error('用户不存在')
    }
    user.password = undefined
    await req.login(user)
    return user
}))

// 退出登录
router.post('/users/logout', wrap(async req => {
    if (req.user.isAdmin) req.session.currentBranchId = undefined
    req.logout()
}))

// 修改个人信息
router.post('/users/personalInformation', wrap(async req => {
    const user = await User.findById(req.user.id).exec()
    if (user) {
        user.set({ 'email': req.body.email, 'cellphoneNumber': req.body.cellphoneNumber })
        await user.save()
    }
    user.password = undefined
    return user
}))

// 修改密码
router.post('/users/password', wrap(async req => {
    const user = await User.findById(req.user.id).exec()
    if (!user.authenticate(req.body.password)) {
        throw new Error('密码错误')
    }
    user.set('password', req.body.newPassword)
    await user.save()
}))

// 极致验证码 register
router.get('/capcha_register', wrap(async req => {
    console.log('cap -- ip', req.ip)
    const data = await geetest.register({
        client_type: 'web',
        ip_address: req.ip
    })
    req.session.fallback = !data.success
    return data
}))

// 获取验证码图片
router.get('/capcha', (req, res) => {
    const { img, str } = makeCapcha()
    req.session.capcha = str
    res.setHeader('Content-Type', 'image/bmp')
    res.end(img.getFileData())
})

// 生成验证码
function makeCapcha (width = 100, height = 36) {
    const img = new BMP24(width, height)

    img.fillRect(0, 0, img.w - 1, img.h - 1, 0xffffff)

    img.fillRect(rand(0, 100), rand(0, 40), rand(10, 35), rand(10, 35), rand(0, 0xffffff))
    img.drawLine(rand(0, 100), rand(0, 40), rand(0, 100), rand(0, 40), rand(0, 0xffffff))
    // 画曲线
    const w = img.w / 2
    const h = img.h
    const color = rand(0, 0xffffff)
    const y1 = rand(-5, 5) // Y轴位置调整
    const w2 = rand(10, 15) // 数值越小频率越高
    const h3 = rand(4, 6) // 数值越小幅度越大
    const bl = rand(1, 5)
    for (let i = -w; i < w; i += 0.1) {
        const y = Math.floor(h / h3 * Math.sin(i / w2) + h / 2 + y1)
        const x = Math.floor(i + w)
        for (let j = 0; j < bl; j++) {
            img.drawPoint(x, y + j, color)
        }
    }

    const p = 'ABCDEFGHKMNPQRSTUVWXYZ3456789'
    let str = ''
    for (let i = 0; i < 5; i++) {
        str += p.charAt(Math.random() * p.length | 0)
    }

    const fonts = [BMP24.font8x16, BMP24.font12x24, BMP24.font16x32]
    let x = 15
    let y = 8
    for (let i = 0; i < str.length; i++) {
        const f = fonts[Math.random() * fonts.length | 0]
        y = 8 + rand(-10, 10)
        img.drawChar(str[i], x, y, f, rand(0, 0xffffff))
        x += f.w + rand(2, 8)
    }
    return {
        img, str
    }
}

export default router
