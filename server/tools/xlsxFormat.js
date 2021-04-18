import { getExchange, formatNum } from '../tools/util'

const paymentMethodList = {
    10: '现金',
    20: 'POS',
    30: '账户余额',
    35: '赊欠',
    40: '支付宝转账',
    45: '微信转账',
    50: '预留支付宝支付',
    55: '预留微信支付',
    60: '汇款',
    65: '支票',
    70: '其他'
}
const tariffTypeList = {
    0: '后付',
    1: '预付',
    2: '包税'
}
const tariffStateList = {
    0: '未确定',
    1: '毋需支付',
    2: '已确认待支付',
    3: '已支付'
}

export function formatOrderDataForXlsx (orders, form) {
    if (form === 'form1') {
        return formatOrderDataForXlsx1(orders)
    } else if (form === 'form2') {
        return formatOrderDataForXlsx2(orders)
    } else if (form === 'form3') {
        return formatOrderDataForXlsx3(orders)
    } else if (form === 'form4') {
        return formatOrderDataForXlsx4(orders)
    } else if (form === 'form5') {
        return formatOrderDataForXlsx5(orders)
    } else if (form === 'form6') {
        return formatOrderDataForXlsx6(orders)
    } else {
        throw new Error('找不到对应的运单格式')
    }
}

export function formatPalletDataForXlsx (pallet, form) {
    if (form === 'form1') {
        return formatPalletDataForXlsx1(pallet)
    } else {
        throw new Error('找不到对应的托盘格式')
    }
}

function formatOrderDataForXlsx1 (orders) {
    const list = []
    list.push([
        '序号',
        '运单号',
        '线路名称',
        '线路编码',
        '发货网点名称',
        '发货网点编码',
        '托盘号',
        '发件人姓名',
        '发件人手机号码',
        '发件人证件号码',
        '发件人省',
        '发件人市',
        '发件人详细地址',
        '收件人姓名',
        '收件人手机号码',
        '收件人证件号码',
        '收件人省',
        '收件人市',
        '收件人区',
        '收件人详细地址',
        '下单人备注',
        '国内快递公司',
        '国内快递单号',
        '实际重量(LB)',
        '计费重量(LB)',
        '实际重量(KG)',
        '实际重量(KG)',
        '称重操作人',
        '称重时间',
        '运费单价',
        '偏远地区附加费',
        '首磅附加费',
        '运费总额',
        '物料费',
        '保险费',
        '附加保额',
        '未含税标准金额',
        '未含税实收金额',
        '付款方式',
        '付款时间',
        '付款操作人',
        '关税类型',
        '关税状态',
        '关税CAD',
        '关税汇率',
        '关税CNY',
        '含税总额',
        '关税支付方式',
        '关税支付时间',
        '关税支付操作人',
        '是否保价',
        '账户',
        '制单时间',
        '制单人',
        '物品名称',
        '品牌',
        '申报单价',
        '规格',
        '数量',
        '申报总价'
    ])
    if (orders) {
        if (orders._id) {
            orders = [orders]
        }

        let i = 0
        for (const order of orders) {
            if ((order.recipientAddress[0].indexOf('北京') >= 0) || (order.recipientAddress[0].indexOf('天津') >= 0) || (order.recipientAddress[0].indexOf('上海') >= 0) || (order.recipientAddress[0].indexOf('重庆') >= 0)) {
                order.recipientAddress.unshift(order.recipientAddress[0])
            }
            // 改变order内容写在上面,否则会根据goods的行数重复改变

            let t = 0
            for (const orderGoods of order.orderGoods) {
                const item = []
                item.push(++t === 1 ? ++i : i)
                item.push(order.orderNumber)
                item.push(order.line ? order.line.name : '')
                item.push(order.line ? order.line.lineNumber : '')
                item.push(order.branch ? order.branch.name : '')
                item.push(order.branch ? order.branch.branchNumber : '')
                item.push(order.pallet ? order.pallet.palletNumber : '')
                item.push(order.senderName)
                item.push(order.senderCellphoneNumber)
                item.push(order.senderIdNumber)
                item.push(order.senderAddress[0])
                item.push(order.senderAddress[1])
                item.push(order.senderAddress.slice(2).join(''))
                item.push(order.recipientName)
                item.push(order.recipientCellphoneNumber)
                item.push(order.recipientIdNumber)
                item.push(order.recipientAddress[0])
                item.push(order.recipientAddress[1])
                if (order.recipientAddress.length > 3) {
                    item.push(order.recipientAddress[2])
                    item.push(order.recipientAddress.slice(3).join(''))
                } else {
                    item.push('')
                    item.push(order.recipientAddress[2])
                }
                item.push(order.remark)
                item.push(order.transhipmentExpressCompany ? order.transhipmentExpressCompany.name : '')
                item.push(order.transhipmentExpressNumber)
                item.push(order.actualWeight)
                item.push(order.chargeableWeight)
                item.push(order.actualWeight ? (Number(order.actualWeight) * 0.4536).toFixed(4) : '')
                item.push(order.chargeableWeight ? (Number(order.chargeableWeight) * 0.4536).toFixed(4) : '')
                item.push(order.weighingOperator ? order.weighingOperator.username : '')
                item.push(order.weighingTime)
                item.push(order.unitPrice)
                item.push(order.extendedAreaSurcharge)
                item.push(order.poundSurcharge)
                item.push(order.freight)
                item.push(order.materialCost)
                item.push(order.premium)
                item.push(order.coverage)
                item.push(order.standardAmountWithoutTariff)
                item.push(order.amountWithoutTariff)
                item.push(order.paymentMethod >= 0 ? paymentMethodList[order.paymentMethod] : '')
                item.push(order.paymentTime)
                item.push(order.paymentOperator ? order.paymentOperator.username : '')
                item.push(order.tariffType >= 0 ? tariffTypeList[order.tariffType] : '')
                item.push(order.tariffState >= 0 ? tariffStateList[order.tariffState] : '')
                item.push(order.tariff)
                item.push(order.tariffExchangeRate)
                item.push(order.tariffCNY)
                item.push(order.totalAmount)
                item.push(order.tariffPaymentMethod >= 0 ? paymentMethodList[order.tariffPaymentMethod] : '')
                item.push(order.tariffPaymentTime)
                item.push(order.tariffPaymentOperator ? order.tariffPaymentOperator.username : '')
                item.push(order.isValueDeclared ? '是' : '否')
                item.push(order.account ? order.account.username : '')
                item.push(order.createTime)
                item.push(order.creator ? order.creator.username : '')
                item.push(orderGoods.name)
                item.push(orderGoods.brand)
                item.push(orderGoods.valueDeclared)
                item.push(orderGoods.measurementUnit)
                item.push(orderGoods.quantity)
                item.push(orderGoods.valueDeclared * orderGoods.quantity)
                list.push(item)
            }
        }
    }
    return list
}

function formatOrderDataForXlsx2 (orders) {
    const list = []
    list.push([
        '序号',
        '运单号',
        '线路名称',
        '线路编码',
        '发货网点名称',
        '发货网点编码',
        '托盘号',
        '发件人姓名',
        '发件人手机号码',
        '发件人证件号码',
        '发件人省',
        '发件人市',
        '发件人详细地址',
        '收件人姓名',
        '收件人手机号码',
        '收件人证件号码',
        '收件人省',
        '收件人市',
        '收件人区',
        '收件人详细地址',
        '下单人备注',
        '国内快递公司',
        '国内快递单号',
        '实际重量(LB)',
        '计费重量(LB)',
        '实际重量(KG)',
        '实际重量(KG)',
        '称重操作人',
        '称重时间',
        '运费单价',
        '偏远地区附加费',
        '首磅附加费',
        '运费总额',
        '物料费',
        '保险费',
        '附加保额',
        '未含税标准金额',
        '未含税实收金额',
        '付款方式',
        '付款时间',
        '付款操作人',
        '关税类型',
        '关税状态',
        '关税CAD',
        '关税汇率',
        '关税CNY',
        '含税总额',
        '关税支付方式',
        '关税支付时间',
        '关税支付操作人',
        '是否保价',
        '账户',
        '制单时间',
        '制单人',
        '物品信息'
    ])
    if (orders) {
        if (orders._id) {
            orders = [orders]
        }

        let i = 0
        for (const order of orders) {
            if ((order.recipientAddress[0].indexOf('北京') >= 0) || (order.recipientAddress[0].indexOf('天津') >= 0) || (order.recipientAddress[0].indexOf('上海') >= 0) || (order.recipientAddress[0].indexOf('重庆') >= 0)) {
                order.recipientAddress.unshift(order.recipientAddress[0])
            }
            // 改变order内容写在上面

            const item = []
            item.push(++i)
            item.push(order.orderNumber)
            item.push(order.line ? order.line.name : '')
            item.push(order.line ? order.line.lineNumber : '')
            item.push(order.branch ? order.branch.name : '')
            item.push(order.branch ? order.branch.branchNumber : '')
            item.push(order.pallet ? order.pallet.palletNumber : '')
            item.push(order.senderName)
            item.push(order.senderCellphoneNumber)
            item.push(order.senderIdNumber)
            item.push(order.senderAddress[0])
            item.push(order.senderAddress[1])
            item.push(order.senderAddress.slice(2).join(''))
            item.push(order.recipientName)
            item.push(order.recipientCellphoneNumber)
            item.push(order.recipientIdNumber)
            item.push(order.recipientAddress[0])
            item.push(order.recipientAddress[1])
            if (order.recipientAddress.length > 3) {
                item.push(order.recipientAddress[2])
                item.push(order.recipientAddress.slice(3).join(''))
            } else {
                item.push('')
                item.push(order.recipientAddress[2])
            }
            item.push(order.remark)
            item.push(order.transhipmentExpressCompany ? order.transhipmentExpressCompany.name : '')
            item.push(order.transhipmentExpressNumber)
            item.push(order.actualWeight)
            item.push(order.chargeableWeight)
            item.push(order.actualWeight ? (Number(order.actualWeight) * 0.4536).toFixed(4) : '')
            item.push(order.chargeableWeight ? (Number(order.chargeableWeight) * 0.4536).toFixed(4) : '')
            item.push(order.weighingOperator ? order.weighingOperator.username : '')
            item.push(order.weighingTime)
            item.push(order.unitPrice)
            item.push(order.extendedAreaSurcharge)
            item.push(order.poundSurcharge)
            item.push(order.freight)
            item.push(order.materialCost)
            item.push(order.premium)
            item.push(order.coverage)
            item.push(order.standardAmountWithoutTariff)
            item.push(order.amountWithoutTariff)
            item.push(order.paymentMethod >= 0 ? paymentMethodList[order.paymentMethod] : '')
            item.push(order.paymentTime)
            item.push(order.paymentOperator ? order.paymentOperator.username : '')
            item.push(order.tariffType >= 0 ? tariffTypeList[order.tariffType] : '')
            item.push(order.tariffState >= 0 ? tariffStateList[order.tariffState] : '')
            item.push(order.tariff)
            item.push(order.tariffExchangeRate)
            item.push(order.tariffCNY)
            item.push(order.totalAmount)
            item.push(order.tariffPaymentMethod >= 0 ? paymentMethodList[order.tariffPaymentMethod] : '')
            item.push(order.tariffPaymentTime)
            item.push(order.tariffPaymentOperator ? order.tariffPaymentOperator.username : '')
            item.push(order.isValueDeclared ? '是' : '否')
            item.push(order.account ? order.account.username : '')
            item.push(order.createTime)
            item.push(order.creator ? order.creator.username : '')
            item.push(order.orderGoods.map(orderGoods => `[${orderGoods.brand}]${orderGoods.name}(${orderGoods.measurementUnit})*${orderGoods.quantity}`).join('/'))
            list.push(item)
        }
    }
    return list
}

async function formatOrderDataForXlsx3 (orders) {
    const exchangeRate = await getExchange()
    const list = []
    list.push([
        '商家订单号（必填）',
        '批次号（选填）',
        '订单来源（选填）',
        '跟踪单号（选填）',
        '物流单号（选填）',
        '产品编号（必填）',
        '是否溯源（选填）',
        '收件人姓名（必填）',
        '身份证件号码（必填）',
        '收件人省（必填）',
        '收件人市（必填）',
        '收件人区（必填）',
        '收件人街道地址（必填）',
        '收件人电话（必填）',
        '寄件人姓名（必填）',
        '寄件人国家（选填）',
        '寄件人省（选填）',
        '寄件人市（选填）',
        '寄件人地址（必填）',
        '寄件人电话（必填）',
        '商品货号(选填)',
        '商品条形码（选填）',
        'HS编码（选填）',
        '行邮税号（选填）',
        '品牌（必填）',
        '品名（必填）',
        '原产国（选填）',
        '规格型号（必填）',
        '单位（必填）',
        '单件商品毛量（必填）',
        '单件商品净量（必填）',
        '数量（必填）',
        '第一法定单位数量（选填）',
        '单价（元，必填）',
        '币制代码（必填）',
        '订单备注（选填）'
    ])
    if (orders) {
        if (orders._id) {
            orders = [orders]
        }
        for (const order of orders) {
            if ((order.recipientAddress[0].indexOf('北京') >= 0) || (order.recipientAddress[0].indexOf('天津') >= 0) || (order.recipientAddress[0].indexOf('上海') >= 0) || (order.recipientAddress[0].indexOf('重庆') >= 0)) {
                order.recipientAddress.unshift(order.recipientAddress[0])
            }
            // 改变order内容写在上面,否则会根据goods的行数重复改变

            for (const orderGoods of order.orderGoods) {
                const item = []
                item.push(order.orderNumber)
                item.push('')
                item.push('')
                item.push('')
                item.push('')
                item.push('')
                item.push('')
                item.push(order.recipientName)
                item.push(order.recipientIdNumber)
                item.push(order.recipientAddress[0])
                item.push(order.recipientAddress[1])
                if (order.recipientAddress.length > 3) {
                    item.push(order.recipientAddress[2])
                    item.push(order.recipientAddress.slice(3).join(''))
                } else {
                    item.push('')
                    item.push(order.recipientAddress[2])
                }
                item.push(order.recipientCellphoneNumber)
                item.push(order.senderName)
                item.push('Canada')
                item.push('Ontario')
                item.push('Toronto')
                item.push(order.senderAddress[2])
                item.push(order.senderCellphoneNumber)
                item.push('')
                item.push('')
                item.push('')
                item.push('')
                item.push(orderGoods.brand)
                item.push(orderGoods.name)
                item.push('')
                item.push(orderGoods.measurementUnit)
                item.push('件')
                item.push(order.actualWeight ? (Number(order.actualWeight) * 0.4536).toFixed(4) : '')
                item.push(order.actualWeight ? (Number(order.actualWeight) * 0.4536).toFixed(4) : '')
                item.push(orderGoods.quantity)
                item.push('')
                item.push((Number(orderGoods.valueDeclared) * Number(exchangeRate)).toFixed(2))
                item.push('RMB')
                item.push('')
                list.push(item)
            }
        }
    }
    return list
}

export function formatPalletDataForXlsx1 (pallets) {
    const list = []
    list.push([
        '托盘号',
        '归属网点编码',
        '归属网点名称',
        '线路列表',
        '托盘重量(LB)',
        '运单重量合计(LB)',
        '总重量(LB)',
        '托盘重量(KG)',
        '运单重量合计(KG)',
        '总重量(KG)',
        '运费合计',
        '物料费合计',
        '保险费合计',
        '未含税金额合计',
        '预付关税合计',
        '后付关税合计',
        '空运价格',
        '提单号',
        '网点备注',
        '清关备注',
        '创建时间',
        '创建人'
    ])
    if (pallets) {
        if (pallets._id) {
            pallets = [pallets]
        }
        for (const pallet of pallets) {
            const item = []
            item.push(pallet.palletNumber)
            item.push(pallet.branch ? pallet.branch.branchNumber : '')
            item.push(pallet.branch ? pallet.branch.name : '')
            item.push(pallet.lineList.map(line => (line.name)).join('/'))
            item.push(pallet.weight)
            item.push(pallet.orderActualWeight)
            item.push((Number(pallet.weight) + Number(pallet.orderActualWeight)).toFixed(2))
            item.push((Number(pallet.weight) * 0.4536).toFixed(4))
            item.push((Number(pallet.orderActualWeight) * 0.4536).toFixed(4))
            item.push(((Number(pallet.weight) + Number(pallet.orderActualWeight)) * 0.4536).toFixed(4))
            item.push(pallet.orderFreight)
            item.push(pallet.orderMaterialCost)
            item.push(pallet.orderPremium)
            item.push(pallet.orderAmountWithoutTariff)
            item.push(pallet.orderTariff)
            item.push(pallet.orderTariffCNY)
            item.push(pallet.airFreightPrice)
            item.push(pallet.ladingBillNumber)
            item.push(pallet.remark)
            item.push(pallet.clearanceRemark)
            item.push(pallet.createTime)
            item.push(pallet.creator ? pallet.creator.username : '')
            list.push(item)
        }
    }
    return list
}

function formatOrderDataForXlsx4 (orders) {
    const list = []
    list.push([
        '序号',
        '总运单号',
        '订单号',
        '品牌',
        '商品名称',
        '规格型号',
        '毛重（KG）',
        '货品单价',
        '货品总价',
        '商品数量',
        '净重（KG）',
        '收货人名称',
        '收货人省份',
        '收货人城市',
        '收货人地址',
        '收货人电话',
        '身份证证件号',
        '发件人名称',
        '发件人地址',
        '发件人电话',
        '发件人国家'
    ])
    if (orders) {
        if (orders._id) {
            orders = [orders]
        }

        let i = 0
        for (const order of orders) {
            if ((order.recipientAddress[0].indexOf('北京') >= 0) || (order.recipientAddress[0].indexOf('天津') >= 0) || (order.recipientAddress[0].indexOf('上海') >= 0) || (order.recipientAddress[0].indexOf('重庆') >= 0)) {
                order.recipientAddress.unshift(order.recipientAddress[0])
            }
            // 改变order内容写在上面,否则会根据goods的行数重复改变

            let t = 0
            for (const orderGoods of order.orderGoods) {
                const item = []
                item.push(++t === 1 ? ++i : '')
                item.push('')
                item.push(t === 1 ? order.orderNumber : '')
                item.push(orderGoods.brand)
                item.push(orderGoods.name)
                item.push(orderGoods.measurementUnit)
                item.push(t === 1 && order.actualWeight ? (Number(order.actualWeight) * 0.4536).toFixed(4) : '')
                item.push(orderGoods.valueDeclared)
                item.push(orderGoods.valueDeclared * orderGoods.quantity)
                item.push(orderGoods.quantity)
                item.push(t === 1 && order.actualWeight ? (Number(order.actualWeight) * 0.4536).toFixed(4) : '')
                item.push(t === 1 ? order.recipientName : '')
                item.push(t === 1 ? order.recipientAddress[0] : '')
                item.push(t === 1 ? order.recipientAddress[1] : '')
                item.push(t === 1 ? order.recipientAddress.slice(2).join('') : '')
                item.push(t === 1 ? order.recipientCellphoneNumber : '')
                item.push(t === 1 ? ((order.recipientIdNumber && order.recipientIdNumber.trim()) || formatNum(i, '1', 18)) : '')
                item.push(t === 1 ? order.senderName : '')
                item.push(t === 1 ? order.senderAddress.join(' ') : '')
                item.push(t === 1 ? order.senderCellphoneNumber : '')
                item.push(t === 1 ? '501' : '')
                list.push(item)
            }
        }
    }
    return list
}

async function formatOrderDataForXlsx5 (orders) {
    const exchangeRate = await getExchange()
    const list = []
    list.push([
        'PSNo',
        '订单编号',
        '总运单号',
        '快件单号',
        '发件人',
        '发件人城市',
        '发件人地址',
        '发件人电话',
        '发件人国别',
        '收件人',
        '身份证件号码',
        '收件人电话',
        '收件人邮编',
        '收件人省份',
        '收件人城市',
        '收件人地址',
        '内件名称',
        '总数量',
        '币制代码',
        '总价',
        '总净重(KG)',
        '总毛重(KG)',
        '税号',
        '商检商品ID号',
        '物品名称',
        '品牌',
        '规格型号',
        '海关单位换算率',
        '数量',
        '单价',
        '原产国代码',
        '商品HS编码',
        '单位代码',
        '袋号托号',
        '订单网址',
        '商品单个净重'
    ])
    if (orders) {
        if (orders._id) {
            orders = [orders]
        }

        let i = 0
        for (const order of orders) {
            if ((order.recipientAddress[0].indexOf('北京') >= 0) || (order.recipientAddress[0].indexOf('天津') >= 0) || (order.recipientAddress[0].indexOf('上海') >= 0) || (order.recipientAddress[0].indexOf('重庆') >= 0)) {
                order.recipientAddress.unshift(order.recipientAddress[0])
            }
            // 改变order内容写在上面,否则会根据goods的行数重复改变

            for (const orderGoods of order.orderGoods) {
                const item = []
                item.push(++i)
                item.push(order.orderNumber)
                item.push('')
                item.push(order.transhipmentExpressNumber)
                item.push(order.senderName)
                item.push('多伦多')
                item.push(order.senderAddress.slice(2))
                item.push(order.senderCellphoneNumber)
                item.push('501')
                item.push(order.recipientName)
                item.push(order.recipientIdNumber)
                item.push(order.recipientCellphoneNumber)
                item.push('')
                item.push(order.recipientAddress[0])
                item.push(order.recipientAddress[1])
                item.push(order.recipientAddress.slice(2).join(''))
                item.push(orderGoods.brand + orderGoods.name)
                item.push(orderGoods.quantity)
                item.push('142')
                item.push((orderGoods.valueDeclared * orderGoods.quantity * Number(exchangeRate)).toFixed(2))
                item.push(order.actualWeight ? (Number(order.actualWeight) * 0.4536).toFixed(4) : '')
                item.push(order.actualWeight ? (Number(order.actualWeight) * 0.4536).toFixed(4) : '')
                item.push('')
                item.push('')
                item.push(orderGoods.brand + orderGoods.name)
                item.push(orderGoods.brand)
                item.push(orderGoods.measurementUnit)
                item.push(1)
                item.push(1)
                item.push((orderGoods.valueDeclared * Number(exchangeRate)).toFixed(2))
                item.push('501')
                list.push(item)
            }
        }
    }
    return list
}

function formatOrderDataForXlsx6 (orders) {
    const list = []
    list.push([
        '序号',
        '运单号',
        '线路名称',
        '发货网点名称',
        '发货网点编码',
        '发件人姓名',
        '发件人手机号码',
        '发件人证件号码',
        '发件人省',
        '发件人市',
        '发件人详细地址',
        '收件人姓名',
        '收件人手机号码',
        '收件人证件号码',
        '收件人省',
        '收件人市',
        '收件人区',
        '收件人详细地址',
        '下单人备注',
        '国内快递公司',
        '国内快递单号',
        '实际重量(LB)',
        '计费重量(LB)',
        '称重时间',
        '运费单价',
        '偏远地区附加费',
        '首磅附加费',
        '运费总额',
        '物料费',
        '保险费',
        '附加保额',
        '未含税标准金额',
        '未含税实收金额',
        '关税CAD',
        '关税汇率',
        '制单时间',
        '制单人',
        '物品信息'
    ])
    if (orders) {
        if (orders._id) {
            orders = [orders]
        }

        let i = 0
        for (const order of orders) {
            if ((order.recipientAddress[0].indexOf('北京') >= 0) || (order.recipientAddress[0].indexOf('天津') >= 0) || (order.recipientAddress[0].indexOf('上海') >= 0) || (order.recipientAddress[0].indexOf('重庆') >= 0)) {
                order.recipientAddress.unshift(order.recipientAddress[0])
            }
            // 改变order内容写在上面

            const item = []
            item.push(++i)
            item.push(order.orderNumber)
            item.push(order.line ? order.line.name : '')
            item.push(order.branch ? order.branch.name : '')
            item.push(order.branch ? order.branch.branchNumber : '')
            item.push(order.senderName)
            item.push(order.senderCellphoneNumber)
            item.push(order.senderIdNumber)
            item.push(order.senderAddress[0])
            item.push(order.senderAddress[1])
            item.push(order.senderAddress.slice(2).join(''))
            item.push(order.recipientName)
            item.push(order.recipientCellphoneNumber)
            item.push(order.recipientIdNumber)
            item.push(order.recipientAddress[0])
            item.push(order.recipientAddress[1])
            if (order.recipientAddress.length > 3) {
                item.push(order.recipientAddress[2])
                item.push(order.recipientAddress.slice(3).join(''))
            } else {
                item.push('')
                item.push(order.recipientAddress[2])
            }
            item.push(order.remark)
            item.push(order.transhipmentExpressCompany ? order.transhipmentExpressCompany.name : '')
            item.push(order.transhipmentExpressNumber)
            item.push(order.actualWeight)
            item.push(order.chargeableWeight)
            item.push(order.weighingTime)
            item.push(order.unitPrice)
            item.push(order.extendedAreaSurcharge)
            item.push(order.poundSurcharge)
            item.push(order.freight)
            item.push(order.materialCost)
            item.push(order.premium)
            item.push(order.coverage)
            item.push(order.standardAmountWithoutTariff)
            item.push(order.amountWithoutTariff)
            item.push(order.tariff)
            item.push(order.tariffExchangeRate)
            item.push(order.createTime)
            item.push(order.creator ? order.creator.username : '')
            item.push(order.orderGoods.map(orderGoods => `[${orderGoods.brand}]${orderGoods.name}(${orderGoods.measurementUnit})*${orderGoods.quantity}`).join('/'))
            list.push(item)
        }
    }
    return list
}
