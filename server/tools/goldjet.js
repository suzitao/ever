/**
 * 高捷Api
 * @author zitao_su
 */
import { extend, unescapeObject } from '../tools/util'
import axios from 'axios'
import base64 from 'base-64'
import qs from 'qs'

const isPro = process.env.EVERFAST_ENV === 'production'

const baseURL = isPro ? 'https://oms.goldjet.com.cn/api/index.php' : 'http://test.goldjet.com.cn/api/index.php'
const sellerName = isPro ? 'everfast' : 'everfast'
const apiKey = isPro ? 'XXXXXX' : 'XXXXXX'

async function orderBcApiCall (mark, form) {
    extend(form, {
        seller_name: sellerName,
        api_key: apiKey,
        mark
    })
    form.order = Buffer.from(JSON.stringify(form.order).toString()).toString('base64')
    for (const key in form) {
        form[key] = base64.encode(form[key])
    }
    const { data } = await axios.post(`${baseURL}?act=order_bc&op=order`, qs.stringify(form), { headers: { 'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' } })
    unescapeObject(data)
    console.log(JSON.stringify(data))
    if (data.flag === 'OK') return data
    else throw new Error(`${data.info},${data.ordersn}`)
}

// 下单
export function order (order) {
    console.log(order.recipientAddress.join('^^^'))
    const data = {
        is_bc: 1, // 是否BC订单，订单是否走BC，是必填1，否则可空或为0
        order_sn: order.orderNumber, // 订单编号
        express_num: order.transhipmentExpressNumber, // 快件单号
        sender_name: order.senderName, // 发件人姓名
        sender_city: '多伦多', // 发件人城市
        sender_address: 'Suite 10, 4981 Highway 7 East, Markham, ON, L3R 1N1', // 发件人地址
        sender_phone: order.senderCellphoneNumber, // 发件人电话
        sender_country_code: '501', // 发件人国家代码
        buyer_name: order.recipientName, // 收件人姓名
        buyer_phone: order.recipientCellphoneNumber, // 收件人联系电话
        order_name: order.recipientName, // 订购人姓名，BC，是必填，否则可空
        order_idcard: order.recipientIdNumber, // 订购人身份证号码，BC，是必填，否则可空
        order_phone: order.recipientCellphoneNumber, // 订购人电话
        customs_insured: 0, // 保价费，BC，是必填，否则可空
        customs_discount: 0, // 非现金抵扣金额，BC，是必填，否则可空
        order_uname: order.account.username, // 订购人账户名，BC，是必填，否则可空F
        buyer_address: order.recipientAddress.join('^^^'), // 收件人地址，省^^^市^^^区^^^街道^^^具体地址
        buyer_idcard: order.recipientIdNumber, // 收件人身份证号
        curr: 142, // 币制代码，币制代码全国版要求都按人民币申报，请都固定填写142即可
        p_name: 'everfast', // TODO: 支付企业，BC，是必填，否则可空
        p_no: order.orderNumber, // TODO: 支付号，BC，是必填，否则可空
        p_time: order.paymentTime, // TODO: 支付时间，BC，是必填，否则可空 TODO：int(10)，是否为10位时间戳
        pweb: 'https://www.everfast.ca', // 订单网址，Http://www...，BC，是必填，否则可空
        web_name: '极速快递', // 网址名称，BC，是必填，否则可空
        re_no: '123', // TODO: 商家广州备案号
        re_no_qg: '123', // TODO: 商家全国备案号
        re_name: 'everfast', // TODO: 商家备案名称
        express_code: '5', // 快递企业代码，当express_num不为空时，必填，否则可空：1 顺丰， 2 申通， 3 百世汇通，4 邮政小包， 5 圆通， 7 全峰， 8 天天， 11 德邦， 23 韵达
        pkg_gweight: (order.actualWeight * 0.4536).toFixed(2), // 订单总毛重，整个订单包裹的总重量，单位 KG
        goods_nweight: (order.actualWeight * 0.4536).toFixed(2), // 订单总净重，订单所有商品不包含快递包装的重量，单位 KG
        order_amount: eval(order.orderGoods.map(orderGoods => orderGoods.valueDeclared * orderGoods.quantity).join('+')), // 订单总价，订单所有商品的总价不包含运费与税金，单位 RMB
        warehouse_code: '', // 仓库代码，非必填项。填写错误时会报错。香港高捷仓库代码HT_HKGJ TODO: 是否需要
        p_code: '', // TODO: 支付企业备案编号
        main_desc: order.orderGoods.map(orderGoods => `${orderGoods.brand}${orderGoods.name}(${orderGoods.measurementUnit})*${orderGoods.quantity}`).join('+'), // 内件描述，格式：品牌+品名+规格*数量
        order_goods: order.orderGoods.map((orderGoods, index) => {
            return {
                goods_seq: '6901236371987', // TODO: 商品序号，电商平台在全国版申报订单上对应的商品序号，必填，无值退单。订单是否走BC，是必填，否则可空
                goods_barcode: '', // TODO: 商品条形码，可空，不建议为空
                goods_size: '011', // TODO: 实际商品计量单位，海关提供的商品计量单位代码
                goods_unit: '011', // TODO: 商品法定计量单位，海关提供的商品计量单位代码，BC，是必填，否则可空
                goods_hg_num: orderGoods.quantity, // 商品发定计量单位下的商品数量，BC，是必填，否则可空
                goods_gweight: (order.actualWeight / eval(order.orderGoods.map(orderGoods => orderGoods.quantity).join('+')) * 0.4536).toFixed(2), // TODO: 单件商品的重量，单位为KG
                goods_name: orderGoods.name, // 物品名称，
                brand: orderGoods.brand, // 品牌
                goods_spec: orderGoods.measurementUnit, // 规格型号
                goods_num: orderGoods.quantity, // 数量
                goods_price: orderGoods.valueDeclared, // 单价
                ycg_code: '501', // 原产国代码
                hs_code: '1008909000', // TODO: 商品HS编码，BC必填，无值退单，否则可空
                curr: '501' // 商品单价币制，可空，为空自动取原产国
            }
        })
    }
    return orderBcApiCall('order', { confirm: 1, order: data })
}

export function sel (number) {
    const data = {
        order_sn: number
    }
    return orderBcApiCall('sel', { order: data })
}

export function exCode (number) {
    const data = {
        order_sn: number
    }
    return orderBcApiCall('ex_code', { order: data })
}

async function expressOrderApiCall (form) {
    extend(form, {
        seller: sellerName,
        api_key: apiKey
    })
    form.order = Buffer.from(JSON.stringify(form.order).toString()).toString('base64')
    for (const key in form) {
        form[key] = base64.encode(form[key])
    }
    const { data } = await axios.post(`${baseURL}?act=express_order&op=index`, qs.stringify(form), { headers: { 'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' } })
    unescapeObject(data)
    console.log(JSON.stringify(data))
    if (data.flag === 'OK') return data
    else throw new Error(`${data.info}`)
}

export function expressOrder (order, type) {
    if ((order.recipientAddress[0].indexOf('北京') >= 0) || (order.recipientAddress[0].indexOf('天津') >= 0) || (order.recipientAddress[0].indexOf('上海') >= 0) || (order.recipientAddress[0].indexOf('重庆') >= 0)) {
        order.recipientAddress.unshift(order.recipientAddress[0])
    }
    let data
    if (type === 20) {
        data = {
            order_sn: order.orderNumber, // 订单编号，不能重复
            send_name: 'everfast', // 寄件人姓名
            send_telno: '6479782999', // 寄件人联系电话
            send_code: 3, // 寄件地址代码：1花东仓，2保税仓
            receive_name: order.recipientName, // 收件人姓名
            receive_telno: order.recipientCellphoneNumber, // 收件人联系电话
            receive_province: order.recipientAddress[0], // 收件省份
            receive_city: order.recipientAddress[1], // 收件城市
            receive_area: (order.recipientAddress.length > 3 ? order.recipientAddress[2] : ''), // 收件区镇
            receive_address: order.recipientAddress.join(' '), // 收件详细地址
            goods_name: order.orderGoods.map(orderGoods => `${orderGoods.brand || ''}${orderGoods.name}(${orderGoods.measurementUnit})*${orderGoods.quantity}`).join('/'), // 多个物品都写在同一行，用逗号隔开
            goods_num: eval(order.orderGoods.map(orderGoods => orderGoods.quantity).join('+')), // 物品总数量
            weight: (order.actualWeight * 0.4536).toFixed(2), // 重量
            send_address: 'Suite 10, 4981 Highway 7 East, Markham, ON, L3R 1N1, Canada' // 寄件详细地址
        }
    } else if (type === 21) {
        data = {
            order_sn: order.orderNumber, // 订单编号，不能重复
            send_name: order.senderName, // 寄件人姓名
            send_telno: order.senderCellphoneNumber, // 寄件人联系电话
            send_code: 3, // 寄件地址代码：1花东仓，2保税仓
            receive_name: order.recipientName, // 收件人姓名
            receive_telno: order.recipientCellphoneNumber, // 收件人联系电话
            receive_province: order.recipientAddress[0], // 收件省份
            receive_city: order.recipientAddress[1], // 收件城市
            receive_area: (order.recipientAddress.length > 3 ? order.recipientAddress[2] : ''), // 收件区镇
            receive_address: order.recipientAddress.join(' '), // 收件详细地址
            goods_name: order.orderGoods.map(orderGoods => `${orderGoods.brand}${orderGoods.name}(${orderGoods.measurementUnit})*${orderGoods.quantity}`).join('/'), // 多个物品都写在同一行，用逗号隔开
            goods_num: eval(order.orderGoods.map(orderGoods => orderGoods.quantity).join('+')), // 物品总数量
            weight: (order.actualWeight * 0.4536).toFixed(2), // 重量
            send_address: order.senderAddress.join(' ')
        }
    }
    return expressOrderApiCall({
        express: 5,
        order_type: 1,
        order: data
    })
}

async function orderPerApiCall (mark, form) {
    extend(form, {
        seName: sellerName,
        key: apiKey,
        mark
    })
    form.order = Buffer.from(JSON.stringify(form.order).toString()).toString('base64')
    for (const key in form) {
        form[key] = base64.encode(form[key])
    }
    const { data } = await axios.post(`${baseURL}?act=air_import_order_per&op=order`, qs.stringify(form), { headers: { 'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' } })
    unescapeObject(data)
    console.log(JSON.stringify(data))
    if (data.flag) {
        if (data.flag === 'OK') return data
        else throw new Error(`${data.info},${data.ordersn}`)
    } else {
        return data
    }
}

export function orderPerExCode (number) {
    const data = {
        orderSn: number
    }
    return orderPerApiCall('ex_code', { order: data })
}

export function orderPerSel (number) {
    const data = {
        orderSn: number
    }
    return orderPerApiCall('sel', { order: data })
}
