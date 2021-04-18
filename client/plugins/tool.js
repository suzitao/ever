/**
 * 根据target字段继承属性
 * @param {object} target
 * @param {object} source
 */
export function smartExtend (target, source) {
    Object.keys(target).forEach(key => {
        if (source.hasOwnProperty(key)) {
            target[key] = Array.isArray(source[key]) ? Array.prototype.slice.call(source[key]) : source[key]
        }
    })
    return target
}

export const isEmptyObject = object => {
    let isEmpty = true
    for (const name in object) {
        if (object[name].toString().trim()) {
            isEmpty = false
        }
    }
    return isEmpty
}

export function extend (target, source) {
    Object.keys(source).forEach(key => {
        target[key] = Array.isArray(source[key]) ? Array.prototype.slice.call(source[key]) : source[key]
    })
    return target
}

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

export function formateBoolean (boolean) {
    return boolean ? '是' : '否'
}

export function orderListAmount (order) {
    const isDispalyAmountWithoutTariff = (order.state >= 20 && order.state < 90)
    const isDispalyTariff = ((order.state >= 20 && order.state < 90) && (order.tariffType === 1 || order.tariffType === 2 || (order.tariffType === 0 && (order.tariffState === 1 || order.tariffState === 3))))
    const isDispalyTariffCNY = ((order.state >= 20 && order.state < 90) && (order.tariffType === 0 && order.tariffState === 2))
    const isDispalyTotalAmount = ((order.state >= 20 && order.state < 90) && (order.tariffType === 1 || order.tariffType === 2 || (order.tariffType === 0 && (order.tariffState === 1 || order.tariffState === 3))))

    return (isDispalyAmountWithoutTariff ? '$' + order.amountWithoutTariff : '') + (isDispalyTariff ? '/$' + order.tariff : '') + (isDispalyTariffCNY ? '/￥' + order.tariffCNY : '') + (isDispalyTotalAmount ? '/$' + order.totalAmount : '')
}

export function getSum (array, field) {
    return array.reduce((a, b) => a + (field ? b[field] : b), 0)
}

export const trimObject = source => {
    let result
    if (source === null) {
        result = null
    } else if (source === undefined) {
        result = undefined
    } else if (typeof source === 'object') {
        result = source.constructor === Array ? [] : {}
        for (var index in source) {
            result[index] = trimObject(source[index])
        }
    } else if (typeof source === 'string') {
        result = source.trim()
    } else {
        result = source
    }
    return result
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

export const validatePhoneNumber = (phoneNumber, area, tipArea) => {
    const exp = {
        china: /^1[0-9]{10}$/,
        canada: /^[2-9][0-9]{9}$/
    }
    if (!exp[area]) {
        return new Error(`不存在的地区`)
    }
    if (phoneNumber && !exp[area].test(phoneNumber)) {
        return new Error(`请输入${tipArea}手机号码(毋需国际区号)`)
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

export function loadScript (url) {
    var script = document.createElement('script')
    script.setAttribute('type', 'text/javascript')
    script.setAttribute('src', url)
    document.body.appendChild(script)
}

export const openUrl = url => {
    window.open(url)
}

export function countOrder () {
    const {quantity, amountWithoutTariffCount, tariffCount, totalAmountCount, actualWeightCount, chargeableWeightCount} = {
        quantity: this.selectedList.length,
        amountWithoutTariffCount: getSum(this.selectedList, 'amountWithoutTariff').toFixed(2),
        tariffCount: getSum(this.selectedList, 'tariff').toFixed(2),
        totalAmountCount: getSum(this.selectedList, 'totalAmount').toFixed(2),
        actualWeightCount: getSum(this.selectedList, 'actualWeight').toFixed(2),
        chargeableWeightCount: getSum(this.selectedList, 'chargeableWeight').toFixed(2)
    }
    this.$alert(
        `所选运单数：${quantity}\r未含税实收金额合计：${amountWithoutTariffCount}\r税额合计：${tariffCount}\r含税实收金额合计：${totalAmountCount}\r实际重量合计：${actualWeightCount}\r计费重量合计${chargeableWeightCount}`,
        '统计',
        { confirmButtonText: '关闭' }
    )
}

export function downloadFile (blob, fileName) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
}
