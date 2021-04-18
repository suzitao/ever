/**
 * Created by jim on 6/22/2017.
 */
import ExchangeRate from '../models/exchangeRate'

export function promiseOrCallback (fn, ctx, modifyRes) {
    return function () {
        const context = ctx || this
        const args = Array.prototype.slice.apply(arguments)
        // 判断调用函数时实际传过来的参数数量
        if (typeof args[args.length - 1] === 'function') {
            // 这是callback方式调用的
            return fn.apply(context, args)
        }
        // 这是promise方式调用的
        return new Promise((resolve, reject) => {
            // 创建一个callback函数用来对接promise的resolve和reject
            args.push((err, ret) => {
                err ? reject(err) : resolve(modifyRes ? modifyRes(ret) : ret)
            })
            fn.apply(context, args)
        })
    }
}

export function handleResp (res, promise) {
    promise.then((data) => {
        res.json({success: true, data})
    })
        .catch(err => {
            const message = (typeof err === 'string' ? err : err.message) || '未知错误QAQ'
            res.json({success: false, message})
            if (process.env.NODE_ENV !== 'production') {
                console.warn(err)
            }
        })
}
/**
 * express中间件封装
 * @param {function} gen async函数
 */
export function wrap (gen) {
    return function (req, res, next) {
        handleResp(res, gen(req, res))
    }
}
export function extend (target, source) {
    Object.keys(source).forEach(key => {
        if (source.hasOwnProperty(key)) {
            target[key] = Array.isArray(source[key]) ? Array.prototype.slice.call(source[key]) : source[key]
        }
    })
    return target
}
/**
 * extendByKey
 * @param {object} target 被复制的对象
 * @param {object} source 复制源对象
 * @param {string[]} keys 需要复制的属性
 */
export function extendByKey (target, source, keys) {
    if (!keys) {
        keys = Object.keys(source)
    }
    keys.forEach(key => {
        if (source.hasOwnProperty(key)) {
            target[key] = source[key]
        }
    })
    return target
}

export function regIfExist (target, keys) {
    keys.forEach(key => {
        if (target[key]) {
            target[key] = new RegExp(target[key])
        } else {
            delete target[key]
        }
    })
    return target
}

export function rand (min, max) {
    return Math.random() * (max - min + 1) + min | 0
}

export function formatDate (date, fmt) {
    if (!(date instanceof Date)) {
        date = new Date(date)
    }
    var o = {
        'M+': date.getMonth() + 1, // 月份
        'd+': date.getDate(), // 日
        'H+': date.getHours(), // 小时
        'm+': date.getMinutes(), // 分
        's+': date.getSeconds(), // 秒
        'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
        'S': date.getMilliseconds() // 毫秒
    }
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
    for (var k in o) {
        if (new RegExp(`(${k})`).test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
    }
    return fmt
}

export const trimObject = source => {
    if (source === null) return null
    else if (source === undefined) return undefined
    else if (typeof source === 'object') {
        for (const index in source) {
            if (typeof source[index] === 'string') source[index] = source[index].trim()
            else source[index] = trimObject(source[index])
        }
        return source
    } else if (typeof source === 'string') {
        return source.trim()
    } else return source
}

export const deepCopy = source => {
    let result
    if (source === null) {
        result = null
    } else if (source === undefined) {
        result = undefined
    } else if (typeof source === 'object') {
        result = source.constructor()
        for (var index in source) {
            result[index] = deepCopy(source[index])
        }
    } else {
        result = source
    }
    return result
}

export const escapeObject = source => {
    if (source === null) {
        source = null
    } else if (source === undefined) {
        source = undefined
    } else if (typeof source === 'object') {
        for (var index in source) {
            source[index] = escapeObject(source[index])
        }
    } else {
        source = escape(source)
    }
    return source
}

export const unescapeObject = source => {
    if (source === null) {
        source = null
    } else if (source === undefined) {
        source = undefined
    } else if (typeof source === 'object') {
        for (var index in source) {
            source[index] = unescapeObject(source[index])
        }
    } else {
        source = unescape(source)
    }
    return source
}

export const formatChinaCellphoneNumber = cellphoneNumber => {
    if (cellphoneNumber) {
        cellphoneNumber = cellphoneNumber.toString().replace(/\s/g, '')
    } else {
        return cellphoneNumber
    }
    if (cellphoneNumber.indexOf('0086') === 0) {
        return cellphoneNumber.slice(4)
    } else if (cellphoneNumber.indexOf('086') === 0) {
        return cellphoneNumber.slice(3)
    } else if (cellphoneNumber.indexOf('+86') === 0) {
        return cellphoneNumber.slice(3)
    } else if (cellphoneNumber.indexOf('86') === 0) {
        return cellphoneNumber.slice(2)
    } else {
        return cellphoneNumber
    }
}

export const formatCanadaCellphoneNumber = cellphoneNumber => {
    if (cellphoneNumber) {
        cellphoneNumber = cellphoneNumber.toString().replace(/\s/g, '')
    } else {
        return cellphoneNumber
    }
    if (cellphoneNumber.indexOf('001') === 0) {
        return cellphoneNumber.slice(3)
    } else if (cellphoneNumber.indexOf('01') === 0) {
        return cellphoneNumber.slice(2)
    } else if (cellphoneNumber.indexOf('+1') === 0) {
        return cellphoneNumber.slice(2)
    } else if (cellphoneNumber.indexOf('1') === 0) {
        return cellphoneNumber.slice(1)
    } else {
        return cellphoneNumber
    }
}

export const identityCodeValid = code => {
    const city = {11: '北京', 12: '天津', 13: '河北', 14: '山西', 15: '内蒙古', 21: '辽宁', 22: '吉林', 23: '黑龙江 ', 31: '上海', 32: '江苏', 33: '浙江', 34: '安徽', 35: '福建', 36: '江西', 37: '山东', 41: '河南', 42: '湖北 ', 43: '湖南', 44: '广东', 45: '广西', 46: '海南', 50: '重庆', 51: '四川', 52: '贵州', 53: '云南', 54: '西藏 ', 61: '陕西', 62: '甘肃', 63: '青海', 64: '宁夏', 65: '新疆', 71: '台湾', 81: '香港', 82: '澳门', 91: '国外'}
    let tip = ''
    let pass = true

    if (!code || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(code)) {
        tip = '身份证号格式错误'
        pass = false
    } else if (!city[code.substr(0, 2)]) {
        tip = '地址编码错误'
        pass = false
    } else {
        // 18位身份证需要验证最后一位校验位
        if (code.length === 18) {
            code = code.split('')
            // ∑(ai×Wi)(mod 11)
            // 加权因子
            const factor = [ '7', '9', '10', '5', '8', '4', '2', '1', '6', '3', '7', '9', '10', '5', '8', '4', '2' ]
            // 校验位
            const parity = [ '1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2' ]
            let sum = 0
            let ai = 0
            let wi = 0
            for (var i = 0; i < 17; i++) {
                ai = code[i]
                wi = factor[i]
                sum += ai * wi
            }
            if (parity[sum % 11] !== code[17]) {
                tip = '校验位错误'
                pass = false
            }
        }
    }
    if (!pass) {
        console.log(tip)
    }
    return code.length === 18
}
export const getExchange = async () => {
    const exchangeRate = await ExchangeRate.findOne({ status: 0 }, { value: 1 }).sort({ createTime: -1 })
    if (!exchangeRate) {
        throw new Error('请先维护系统汇率')
    }
    return exchangeRate.value
}

export function defer () {
    let _resolve
    let _reject
    let promise = new Promise((resolve, reject) => {
        _resolve = resolve
        _reject = reject
    })
    return {
        promise,
        resolve: _resolve,
        reject: _reject
    }
}

export const formatNum = (num, indexNum = '0', mixLen = 4) => {
    num = String(num)
    return num.length < mixLen ? (indexNum.repeat(mixLen - num.length) + num) : num
}
