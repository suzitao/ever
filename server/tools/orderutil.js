import Order from '../models/order'
import ShipmentDetail from '../models/shipmentDetail'
import ExchangeRate from '../models/exchangeRate'
import { accountAmountChange, getAccountAmount } from '../tools/userutil'
import { getObjectId } from '../tools/dbutil'
import { defer } from '../tools/util'
import { addConsumptionRecord } from '../tools/capitaldetailutil'
import CapitalDetail from '../models/capitalDetail'

let _defer = null

export async function orderPayByBalance (orderId, operator) {
    const _lastDefer = _defer
    const _newDefer = defer()
    _defer = _newDefer
    let order
    try {
        if (_lastDefer) await _lastDefer.promise
        order = await Order.findById(orderId).exec()
        console.log(order.orderNumber, '开始付款')
        if (order.state !== 20) {
            throw new Error('运单状态不符')
        }
        const capitalDetial = await CapitalDetail.findOne({ recordType: {$in: [10, 15]}, order: orderId, status: 0 })
        if (capitalDetial) {
            throw new Error('运单已付款')
        }
        if (order.tariffType === 1) {
            await accountAmountChange(order.account, (Number(order.totalAmount) * -1))
            await addConsumptionRecord({
                account: order.account,
                order: order,
                branch: order.branch,
                amount: order.totalAmount,
                recordType: 15,
                illustration: `含预付关税`
            }, operator)
            const user = await getAccountAmount(order.account)
            order.set('tariffPaymentMethod', user.accountAmount < 0 ? 35 : 30)
            order.set('tariffPaymentOperator', operator)
            order.set('tariffPaymentTime', new Date())
        } else {
            await accountAmountChange(order.account, (Number(order.amountWithoutTariff) * -1))
            await addConsumptionRecord({
                account: order.account,
                order: order,
                branch: order.branch,
                amount: order.amountWithoutTariff,
                recordType: 10
            }, operator)
        }
        const user = await getAccountAmount(order.account)
        order.set('state', 30)
        order.set('paymentMethod', user.accountAmount < 0 ? 35 : 30)
        order.set('paymentOperator', operator)
        order.set('paymentTime', new Date())
        await order.save()
        try {
            new ShipmentDetail({
                order: order._id,
                information: '运单' + order.orderNumber + '等待入库[Canada]',
                creator: operator
            }).save()
        } catch (error) {
            console.log(error)
        }
        console.log(order.orderNumber, '付款成功', order._id)
        return order.orderNumber
    } catch (e) {
        console.log(order.orderNumber, e.message, order._id)
        throw e
    } finally {
        _newDefer.resolve()
    }
}

export async function tariffPayByBalance (orderId, operator) {
    const order = await Order.findById(orderId).exec()
    console.log(order.state)
    if (order.state !== 65 || order.tariffType !== 0 || order.tariffState !== 2) {
        throw new Error('运单状态不符')
    }
    const exchangeRate = await ExchangeRate.findOne({ status: 0 }, { value: 1 }).sort({ createTime: -1 })
    if (!exchangeRate) {
        throw new Error('系统未设置汇率')
    }
    const capitalDetial = await CapitalDetail.findOne({ recordType: 20, order: orderId, status: 0 })
    if (capitalDetial) {
        throw new Error('运单已支付关税')
    }
    const tariff = (Number(order.tariffCNY) / Number(exchangeRate.value)).toFixed(2)
    const totalAmount = (Number(order.amountWithoutTariff) + Number(tariff)).toFixed(2)
    await accountAmountChange(order.account, (Number(tariff) * -1).toFixed(2))
    await addConsumptionRecord({
        account: order.account,
        order: order,
        branch: order.branch,
        amount: tariff,
        recordType: 20,
        illustration: `CNY:${order.tariffCNY}/Exchange Rate:${exchangeRate.value}`
    }, operator)
    const user = await getAccountAmount(order.account)
    if (order.knState === '0') {
        order.set('state', 60)
    } else if (order.knState === '3') {
        order.set('state', 80)
    } else {
        order.set('state', 70)
    }
    order.set('tariff', tariff)
    order.set('tariffExchangeRate', exchangeRate.value)
    order.set('totalAmount', totalAmount)
    order.set('tariffState', 3)
    order.set('tariffPaymentMethod', user.accountAmount < 0 ? 35 : 30)
    order.set('tariffPaymentOperator', operator)
    order.set('tariffPaymentTime', new Date())
    await order.save()
    try {
        new ShipmentDetail({
            order: order._id,
            information: '运单' + order.orderNumber + '已支付关税',
            creator: operator
        }).save()
    } catch (error) {
        console.log(error)
    }
    return order.orderNumber
}

// 实际重量
export async function countWeightGroupByPallet (palletId) {
    const result = await Order.aggregate([{ $match: { pallet: getObjectId(palletId), status: 0 } }, { $group: { _id: 'totalActualWeight', value: { $sum: '$actualWeight' } } }])
    return result[0] ? Number(result[0].value.toFixed(2)) : 0
}

// 未税总额
export async function countAmountWithoutTariffGroupByPallet (palletId) {
    const result = await Order.aggregate([{ $match: { pallet: getObjectId(palletId), status: 0 } }, { $group: { _id: 'totalAmountWithoutTariff', value: { $sum: '$amountWithoutTariff' } } }])
    return result[0] ? Number(result[0].value.toFixed(2)) : 0
}

// 运费总额
export async function countFreightGroupByPallet (palletId) {
    const result = await Order.aggregate([{ $match: { pallet: getObjectId(palletId), status: 0 } }, { $group: { _id: 'totalFreight', value: { $sum: '$freight' } } }])
    return result[0] ? Number(result[0].value.toFixed(2)) : 0
}

// 物料费
export async function countMaterialCostGroupByPallet (palletId) {
    const result = await Order.aggregate([{ $match: { pallet: getObjectId(palletId), status: 0 } }, { $group: { _id: 'totalMaterialCost', value: { $sum: '$materialCost' } } }])
    return result[0] ? Number(result[0].value.toFixed(2)) : 0
}

// 保险费
export async function countPremiumGroupByPallet (palletId) {
    const result = await Order.aggregate([{ $match: { pallet: getObjectId(palletId), status: 0 } }, { $group: { _id: 'totalPremium', value: { $sum: '$premium' } } }])
    return result[0] ? Number(result[0].value.toFixed(2)) : 0
}

// 预付关税
export async function countTariffGroupByPallet (palletId) {
    const result = await Order.aggregate([{ $match: { pallet: getObjectId(palletId), tariffType: 1, status: 0 } }, { $group: { _id: 'totalTariff', value: { $sum: '$tariff' } } }])
    return result[0] ? Number(result[0].value.toFixed(2)) : 0
}

// 后付关税
export async function countTariffCNYGroupByPallet (palletId) {
    const result = await Order.aggregate([{ $match: { pallet: getObjectId(palletId), tariffType: 0, status: 0 } }, { $group: { _id: 'totalTariffCNY', value: { $sum: '$tariffCNY' } } }])
    return result[0] ? Number(result[0].value.toFixed(2)) : 0
}

export const countOrderByPallet = async (palletId) => {
    const result = await Order.aggregate([{ $match: { pallet: getObjectId(palletId), status: 0 } }, { $group: { _id: 'countOrderByPallet', value: { $sum: 1 } } }])
    return result[0] ? result[0].value : 0
}

export const countNotDispatchOrderByPallet = async (palletId) => {
    const result = await Order.aggregate([{ $match: { state: {$lt: 70}, pallet: getObjectId(palletId), status: 0 } }, { $group: { _id: 'countNotDispatchOrderByPallet', value: { $sum: 1 } } }])
    return result[0] ? result[0].value : 0
}

export const countDispatchingOrderByPallet = async (palletId) => {
    const result = await Order.aggregate([{ $match: { state: 70, pallet: getObjectId(palletId), status: 0 } }, { $group: { _id: 'countDispatchingOrderByPallet', value: { $sum: 1 } } }])
    return result[0] ? result[0].value : 0
}

export const countDispatchedOrderByPallet = async (palletId) => {
    const result = await Order.aggregate([{ $match: { state: 80, pallet: getObjectId(palletId), status: 0 } }, { $group: { _id: 'countDispatchedOrderByPallet', value: { $sum: 1 } } }])
    return result[0] ? result[0].value : 0
}

// 根据用户统计已付款的运单总额
export const countOrderAmountByAccount = async (accountId) => {
    const result = await Order.aggregate([{ $match: { account: accountId, state: { $gte: 30, $lt: 90 } } }, { $group: { _id: 'countOrderAmountByAccount', value: { $sum: '$amountWithoutTariff' } } }])
    return result[0] ? Number(result[0].value.toFixed(2)) : 0
}

// 根据用户统计已付款的关税总额
export const countOrderTrafficByAccount = async (accountId) => {
    const result1 = await Order.aggregate([{ $match: { account: accountId, tariffType: 0, tariffState: 3 } }, { $group: { _id: 'countOrderTrafficByAccount', value: { $sum: '$tariff' } } }])
    const result2 = await Order.aggregate([{ $match: { account: accountId, tariffType: {$in: [1, 2]}, state: { $gte: 30, $lt: 90 } } }, { $group: { _id: 'countOrderTrafficByAccount', value: { $sum: '$tariff' } } }])
    return Number(((result1[0] ? result1[0].value : 0) + ((result2[0] ? result2[0].value : 0))).toFixed(2))
}
