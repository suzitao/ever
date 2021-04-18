import xlsx from 'node-xlsx'

import { Order, Pallet, ExpressCompany, ShipmentDetail, Contacts, CommonGoods, OrderGoods, Branch, TraceUpdateRecord } from '../models'

import * as shipmentDetailService from './shipmentDetail'
import * as personInfoService from './personInfo'
import * as kdniaoService from './kdniao'
import * as stoService from './sto'
import * as smsService from './sms'

import { extendByKey, trimObject, formatChinaCellphoneNumber, formatCanadaCellphoneNumber, identityCodeValid } from '../tools/util'
import { orderPayByBalance } from '../tools/orderutil'
import generateNumber from '../tools/generateNumber'
import queue from '../tools/queue'
import redisClient from '../tools/redis'

// 运单称重
export async function orderWeigh (orderNumber, weighData, reqUserId) {
    const order = await Order.findOne({ orderNumber }).populate('orderGoods').exec()

    if (!order) {
        throw new Error('订单不存在')
    }

    console.log(order)
    console.log(order.state)
    if ([10, 20].indexOf(order.state) === -1) {
        throw new Error('运单状态不为10,20')
    }

    const oldState = order.state

    if (Number(weighData.premium) > 0) {
        order.isValueDeclared = true
        order.isAgreeToInsuranceClause = true
    } else {
        order.isValueDeclared = false
    }

    const freight = (((Number(weighData.unitPrice) + Number(weighData.extendedAreaSurcharge)) * Number(weighData.chargeableWeight)) + Number(weighData.poundSurcharge)).toFixed(2)
    const standardAmountWithoutTariff = (Number(freight) + Number(weighData.materialCost) + Number(weighData.premium)).toFixed(2)
    const totalAmount = (Number(weighData.amountWithoutTariff) + Number(weighData.tariff)).toFixed(2)

    order.state = 20
    order.freight = freight
    order.standardAmountWithoutTariff = standardAmountWithoutTariff
    order.totalAmount = totalAmount
    order.weighingOperator = reqUserId
    order.weighingTime = new Date()

    extendByKey(order, weighData, ['unitPrice', 'extendedAreaSurcharge', 'actualWeight', 'chargeableWeight', 'poundSurcharge', 'materialCost', 'tariff', 'coverage', 'premium', 'amountWithoutTariff'])

    await order.save()

    if (order.isSendMessage && oldState === 10) {
        smsService.sendIdCardSMS([order.recipientCellphoneNumber], order.orderNumber)
    }

    let information = `运单${order.orderNumber}已揽收[Canada]`
    if (order.transhipmentExpressNumber) information = information + `，分配国内运单号[圆通${order.transhipmentExpressNumber}]`
    new ShipmentDetail({ order: order._id, information, creator: reqUserId }).save()
}

// 运单匹配
export async function orderMatch (datas, { cover, user, branchId }) {
    const result = []

    const expressCache = {}

    function getExpressCompany (expressNumber) {
        if (expressCache.hasOwnProperty(expressNumber)) {
            return expressCache[expressNumber]
        }
        const expressCompany = ExpressCompany.findOne({
            expressCompanyNumber: expressNumber,
            status: 0
        }).select('_id name').exec()
        return (expressCache[expressNumber] = expressCompany)
    }

    await queue(datas, 5, async ([orderNumber, expressNumber, expressCompany]) => {
        if (!(orderNumber && expressCompany && expressNumber)) {
            return r('error', '信息不完整')
        }

        try {
            const order = await Order.findOne({
                orderNumber,
                status: 0
            })
            const ec = await getExpressCompany(expressCompany)

            if (!order || !ec) {
                console.log('运单或快递公司不存在', { orderNumber, expressCompany }, { order, expressCompany: ec })
                return r('ignore', '运单或快递公司不存在')
            }
            if (order.state === 10 || order.state === 90) {
                return r('ignore', '运单状态不符')
            }
            if (order.branch.toString() !== branchId) {
                return r('error', '运单不在当前店铺')
            }
            if (order.transhipmentExpressCompany && order.transhipmentExpressNumber && order.transhipmentExpressNumber === expressNumber && order.transhipmentExpressCompany.toString() === expressCompany) {
                return r('ignore', '运单已匹配，本次匹配物流信息与上次相同')
            }
            // 非覆盖模式
            if (!cover && (order.transhipmentExpressCompany && order.transhipmentExpressNumber && (order.transhipmentExpressNumber !== expressNumber || order.transhipmentExpressCompany.toString() !== expressCompany))) {
                return r('ignore', '运单已匹配，如需重新匹配请选择覆盖原有匹配')
            }
            order.transhipmentExpressCompany = ec._id
            order.transhipmentExpressNumber = expressNumber
            await order.save()
            await addShipmentDetail({
                order: order._id,
                information: `运单${order.orderNumber}由[${ec.name}]派送，快递单号[${expressNumber}]`,
                creator: user._id
            })
            // 订阅推送
            _orderTrack(order) // not await
            r('success')
        } catch (error) {
            r('error', error.message)
            console.log('运单匹配错误', error.message)
        }

        function r (type, message) {
            result.push({
                type: type,
                data: [orderNumber, expressNumber, expressCompany],
                message: message
            })
        }
    })

    return result
}

export const batchPay = async (orderIdList, paymentMethod, controlType, progressId, userId) => {
    const orders = await Order.find(
        { _id: orderIdList, status: 0 },
        { _id: 1, orderNumber: 1 }
    )
    await redisClient.set(`progressId:${progressId}`, JSON.stringify({ percentage: 10 }), 'EX', 86400)
    const orderCount = orders.length
    let result = []
    let seccessList = []
    for (var index in orders) {
        try {
            if (paymentMethod === '30') {
                await orderPayByBalance(orders[index]._id, userId)
            } else {
                throw new Error('请选择正确支付方式')
            }
            result.push({ orderNumber: orders[index].orderNumber, message: '付款成功' })
            seccessList.push(orders[index]._id)
        } catch (e) {
            result.push({ orderNumber: orders[index].orderNumber, message: `付款失败(${e.message} ${orders[index]._id})` })
        } finally {
            const percentage = parseInt((result.length / orderCount) * 80 + 10)
            await redisClient.set(`progressId:${progressId}`, JSON.stringify({ percentage }), 'EX', 86400)
        }
    }
    if (controlType === 1) {
        await storage(seccessList, userId)
    }
    await redisClient.set(`progressId:${progressId}`, JSON.stringify({ percentage: 100, result }), 'EX', 86400)
}

// 运单查询和订阅
// export async function _orderSubscribe (order, LogisticCode, ShipperCode) {
//     try {
//         const resp = await kdniaoService.orderTrack({
//             ShipperCode,
//             LogisticCode
//         })
//         console.log('运单查询', resp)
//         if (resp.Success && resp.Traces.length) {
//             await updateKnShipmentDetail(order, resp.Traces)
//             await updateOrderStateFromKn(order, resp)
//         }
//         const data = await kdniaoService.orderSubscribe({
//             ShipperCode,
//             LogisticCode
//         })
//         console.log('添加运单订阅: ', { LogisticCode, ShipperCode }, data)
//     } catch (error) {
//         console.log('运单订阅失败: ', { LogisticCode, ShipperCode }, error)
//     }
// }

// 国内物流信息更新
export async function _orderTrack (order) {
    order = await Order.findOne({_id: order._id || order, status: 0}, { _id: 1, orderNumber: 1, state: 1, knState: 1, transhipmentExpressNumber: 1, transhipmentExpressCompany: 1, recipientCellphoneNumber: 1 }).populate([
        { path: 'transhipmentExpressCompany', select: 'expressCompanyNumber' }
    ]).exec()
    let updateSuccess = false
    let resp
    let errMsg
    if (order.transhipmentExpressNumber && order.transhipmentExpressCompany.expressCompanyNumber && order.knState !== '3' && order.state >= 60 && order.state < 80) {
        // 即时查询
        try {
            if (order.transhipmentExpressCompany.expressCompanyNumber === 'STO') {
                resp = await stoService.orderTrack(order.transhipmentExpressNumber)
            } else {
                const trackParam = {
                    LogisticCode: order.transhipmentExpressNumber,
                    ShipperCode: order.transhipmentExpressCompany.expressCompanyNumber

                }
                if (order.transhipmentExpressCompany.expressCompanyNumber === 'SF') {
                    trackParam.CustomerName = order.recipientCellphoneNumber.substr(order.recipientCellphoneNumber.length - 4)
                }
                resp = await kdniaoService.orderTrack(trackParam)
            }
            if (resp.Traces && resp.Traces.length) {
                await updateKnShipmentDetail(order, resp.Traces)
                await updateOrderStateFromKn(order, resp)
            }
            updateSuccess = true
            // console.log(`更新：运单号[${order.orderNumber}]国内运单号[${order.transhipmentExpressNumber}]快递公司代码[${order.transhipmentExpressCompany.expressCompanyNumber}]`)
        } catch (e) {
            errMsg = e.message
            console.log(`更新：运单号[${order.orderNumber}]国内运单号[${order.transhipmentExpressNumber}]快递公司代码[${order.transhipmentExpressCompany.expressCompanyNumber}]错误[${e.message}]`)
            console.log(e.stack)
        }
        // 订阅
        // try {
        //     if (order.transhipmentExpressCompany.expressCompanyNumber === 'STO') {
        //         console.log('申通不订阅')
        //     } else {
        //         await kdniaoService.orderSubscribe({
        //             LogisticCode: order.transhipmentExpressNumber,
        //             ShipperCode: order.transhipmentExpressCompany.expressCompanyNumber
        //         })
        //     }
        //     // console.log(`订阅：运单号[${order.orderNumber}]国内运单号[${order.transhipmentExpressNumber}]快递公司代码[${order.transhipmentExpressCompany.expressCompanyNumber}]`)
        // } catch (e) {
        //     console.log(`订阅：运单号[${order.orderNumber}]国内运单号[${order.transhipmentExpressNumber}]快递公司代码[${order.transhipmentExpressCompany.expressCompanyNumber}]错误[${e.message}]`)
        // }
        return {success: updateSuccess, orderNumber: order.orderNumber, info: errMsg}
    } else {
        return {success: updateSuccess, orderNumber: order.orderNumber, info: '运单状态需不要更新'}
    }
}

export async function addShipmentDetail (data/* { order, information, creator } */) {
    return new ShipmentDetail(data).save()
}

export async function updateKnShipmentDetail (order, traces) {
    let detail = await ShipmentDetail.findOne({
        order: order._id,
        status: 0,
        isKn: true
    }).exec()
    if (detail) {
        detail.traces = traces
        detail.updateTime = Date.now()
        await detail.save()
    } else {
        detail = await addShipmentDetail({
            isKn: true,
            order: order._id,
            information: '这是由快鸟快递推送的消息',
            traces
        })
    }
    return detail
}

export async function updateOrderState (order, state, userId) {
    if (state === 70 || state === 80) {
        if ((order.tariffType !== 0 || (order.tariffState === 1 || order.tariffState === 3)) && (order.state >= 60 && order.state < 90)) {
            shipmentDetailService.addShipmentDetail(`运单${order.orderNumber}${state === 70 ? '已经开始配送' : '已经签收'}[中国]`, order._id, userId)
        } else {
            throw new Error('单据状态不符')
        }
    }
    order.state = state
    await order.save()
}

export async function updateOrderStateFromKn (order, resp) {
    order.knState = resp.State
    if (order.state >= 60 && order.state < 80 && (order.tariffType !== 0 || order.tariffState === 1 || order.tariffState === 3)) {
        if (resp.State !== '0') order.state = 70 // 已揽收
        if (resp.State === '3') order.state = 80 // 已签收
    }
    await order.save()
}

export function formatShipmentDetail (list) {
    let result = []
    for (const item of list) {
        if (!item.isKn) {
            result.push(item)
        } else {
            result = result.concat(item.traces.map((trace, index) => ({
                _id: `${item._id}_${index}`,
                status: 0,
                isKn: true,
                information: trace.AcceptStation,
                createTime: new Date(trace.AcceptTime + '+0800')
            })))
        }
    }
    return result.sort((a, b) => b.createTime.getTime() - a.createTime.getTime())
}

// 标记运单打印
export async function orderPrint (ids) {
    // const data = await Order.updateMany({
    //     _id: { $in: ids }
    // }, {
    //     $set: { isPrinted: true }
    // })
    ids.map(async id => {
        const order = await Order.findById(id)
        order.printTimes++
        order.isPrinted = true
        order.save()
    })
    // console.log('update print status ', ids, data)
    // return data.nModified
}

export async function getOrdersByExpress ({ transhipmentExpressNumber, expressCompanyNumber }) {
    const expressCompany = await ExpressCompany.findOne({
        expressCompanyNumber,
        status: 0
    }).select('_id').exec()
    if (expressCompany) {
        return Order.find({
            transhipmentExpressNumber,
            transhipmentExpressCompany: expressCompany._id
        })
    }
}

// 托盘设置检查
export async function checkOrderSetPallet (pallet, order, currentBranch) {
    if (!order) {
        throw new Error('运单不存在')
    }
    if (order.pallet) {
        throw new Error('运单已在托盘中')
    }
    if (order.state !== 40) {
        throw new Error('运单状态为(已入库40)才能装盘')
    }
    if (pallet.lineList.indexOf(order.line) === -1) {
        throw new Error('运单线路不符合')
    }
    // 多网点共用同一仓库,去除这个限制
    // if (order.branch && pallet.branch && !order.branch.equals(pallet.branch)) {
    //     throw new Error('托盘与运单不属于同一个店铺')
    // }
    // if (order.branch.toString() !== currentBranch) {
    //     throw new Error(`运单不属于当前店铺`)
    // }
}
// 托盘设置
export async function setPallet (pallet, orderNumber, currentBranch) {
    const order = await Order.findOne({ orderNumber: orderNumber, status: 0 }, { state: 1, branch: 1, pallet: 1, line: 1 })
    await checkOrderSetPallet(pallet, order, currentBranch)
    order.pallet = pallet._id
    order.palletBranch = pallet.branch
    await order.save()
}

// 托盘移除检查
export async function checkOrderRemoveFromPallet (pallet, order, currentBranch) {
    const orderPallet = await Pallet.findOne({ _id: order.pallet, status: 0 }, { state: 1 })
    if (!orderPallet) {
        throw new Error(`运单不在托盘中`)
    }
    if (pallet && !pallet.equals(orderPallet)) {
        throw new Error(`运单不属于当前托盘`)
    }
    if (orderPallet.state !== 10) {
        throw new Error(`运单所属的托盘状态不为(装盘10)`)
    }
    if (!order) {
        throw new Error(`运单不存在`)
    }
    if (order.state !== 40) {
        throw new Error(`运单状态不为(已入库40)`)
    }
    // if (order.branch.toString() !== currentBranch) {
    //     throw new Error(`运单不属于当前店铺`)
    // }
}
// 托盘移除
export async function removeFromPallet (pallet, orderNumber, currentBranch) {
    const order = await Order.findOne({ orderNumber: orderNumber, status: 0 }, { state: 1, branch: 1, pallet: 1, line: 1 })
    await checkOrderRemoveFromPallet(pallet, order, currentBranch)
    order.pallet = null
    order.palletBranch = null
    await order.save()
}
// 入库
export async function storage (orderList, userId) {
    const orders = await Order.find({ _id: orderList, state: 30, status: 0 }, { orderNumber: 1 })
    await Order.update({ _id: orderList, state: 30, status: 0 }, { $set: { 'state': 40 } }, { multi: true }).exec()
    for (var index in orders) {
        try {
            await new ShipmentDetail({
                order: orders[index]._id,
                information: '运单' + orders[index].orderNumber + '已入库，等待发出[Canada]',
                creator: userId
            }).save()
        } catch (error) {
            console.log(error)
        }
    }
}

// 取消入库
export function cancelStorage (orderList, userId) {
    return Order.update({ _id: orderList, state: 40, status: 0 }, { $set: { 'state': 30 } }, { multi: true }).exec()
}

export async function saveContact (order, userId) {
    const sender = {
        name: order.senderName.trim(),
        address: trimObject(order.senderAddress),
        cellphoneNumber: order.senderCellphoneNumber.trim()
    }
    if (order.senderIdNumber) sender.idNumber = order.senderIdNumber.trim()
    let senderId = order.senderId
    const sanderExtendKey = ['name', 'idNumber', 'address', 'cellphoneNumber']
    if (order.saveSender) {
        if (senderId) {
            const contact = await Contacts.findById(senderId).exec()
            extendByKey(contact, sender, sanderExtendKey)
            contact.status = 0
            await contact.save()
        } else {
            const contact = await Contacts.findOne(
                extendByKey({ contactsType: 0, creator: userId }, sender, sanderExtendKey)
            ).exec()
            if (contact) {
                contact.createTime = new Date()
                contact.status = 0
                await contact.save()
                senderId = contact._id
            } else {
                const newContact = await new Contacts(
                    extendByKey({ contactsType: 0, creator: userId }, sender, sanderExtendKey)
                ).save()
                senderId = newContact._id
            }
        }
    }
    const recipient = {
        name: order.recipientName.trim(),
        address: trimObject(order.recipientAddress),
        cellphoneNumber: order.recipientCellphoneNumber.trim(),
        idCardPositiveImg: order.recipientIdCardPositiveImg,
        idCardBackImg: order.recipientIdCardBackImg
    }
    if (order.recipientIdNumber) recipient.idNumber = order.recipientIdNumber.trim()
    let recipientId = order.recipientId
    const recipientExtendKey = ['name', 'idNumber', 'address', 'cellphoneNumber', 'idCardPositiveImg', 'idCardBackImg']
    if (order.saveRecipient) {
        if (recipientId) {
            const contact = await Contacts.findById(recipientId).exec()
            extendByKey(contact, recipient, recipientExtendKey)
            contact.status = 0
            await contact.save()
        } else {
            const contact = await Contacts.findOne(
                extendByKey({ contactsType: 1, creator: userId }, recipient, recipientExtendKey)
            ).exec()
            if (contact) {
                contact.createTime = new Date()
                contact.status = 0
                await contact.save()
                recipientId = contact._id
            } else {
                const newContact = await new Contacts(
                    extendByKey({ contactsType: 1, creator: userId }, recipient, recipientExtendKey)
                ).save()
                recipientId = newContact._id
            }
        }
    }
    return {senderId, recipientId}
}

export async function saveOrderGoods (orderGoods, userId) {
    orderGoods = trimObject(orderGoods)
    if (orderGoods.saveGoods) {
        const commonGoods = await CommonGoods.findOne({
            name: orderGoods.name,
            brand: orderGoods.brand,
            valueDeclared: orderGoods.valueDeclared,
            measurementUnit: orderGoods.measurementUnit,
            creator: userId
        }).exec()
        if (commonGoods) {
            commonGoods.createTime = new Date()
            commonGoods.status = 0
            await commonGoods.save()
        } else {
            await new CommonGoods(
                extendByKey({ creator: userId }, orderGoods, ['name', 'brand', 'measurementUnit', 'valueDeclared'])
            ).save()
        }
    }
}

// 更新全部物流信息
export const updateAllTrace = async (sort = -1) => {
    const date = new Date()
    console.log(date, '更新全部物流信息')
    const orders = await Order.find({
        transhipmentExpressNumber: { $ne: '', $exists: true },
        transhipmentExpressCompany: { $ne: null, $exists: true },
        knState: { $ne: '3' },
        state: { $gte: 60, $lt: 80 },
        status: 0
    }, {
        _id: 1,
        orderNumber: 1
    }).sort({ _id: sort }).exec()
    const traceUpdateRecord = await new TraceUpdateRecord({
        total: orders.length
    }).save()
    const successCount = []
    const failCount = []
    for (let i = 0; i < orders.length; i++) {
        const order = orders[i]
        const { success } = await _orderTrack(order)
        if (success) {
            successCount.push(order.orderNumber)
        } else {
            failCount.push(order.orderNumber)
        }
    }
    traceUpdateRecord.successCount = successCount.length
    traceUpdateRecord.failCount = failCount.length
    traceUpdateRecord.finishTime = new Date()
    await traceUpdateRecord.save()
    console.log(date, `更新${orders.length}个运单`, `成功${successCount.length}个`, `失败${failCount.length}个`)
    return { all: orders.length, success: successCount.length }
}

export const orderImport = async (file, ignoreError, reqUserId) => {
    const workbook = xlsx.parse(file.buffer, { type: 'buffer' })

    const data = trimObject(workbook[0].data.slice(1))

    const orderMap = {}
    const result = []

    for (const [
        num,
        // orderGood
        name, brand, valueDeclared, measurementUnit, quantity,
        // order
        branchNumber, lineNumber, senderName, senderCellphoneNumber, senderIdNumber, senderAddress1, senderAddress2, senderAddress3,
        saveSender, recipientName, recipientCellphoneNumber, recipientIdNumber, recipientAddress1, recipientAddress2, recipientAddress3,
        recipientAddress4, saveRecipient, isSendMessage, remark, coverage, isAgreeToInsuranceClause, isAgreeToForwardingClause
    ] of data) {
        const orderGood = { name, brand, valueDeclared, measurementUnit, quantity }
        // 相同序号为同一运单
        if (orderMap[num]) {
            orderMap[num].orderGoods.push(orderGood)
        } else {
            const _coverage = Number(coverage) || 0
            const senderAddress = [senderAddress1, senderAddress2, senderAddress3].filter(r => r)
            // const recipientAddress = [recipientAddress1, recipientAddress2, recipientAddress3, recipientAddress4].filter(r => {})
            const recipientAddress = []
            if (recipientAddress1 && recipientAddress2 && (recipientAddress2.indexOf('北京') < 0) && (recipientAddress2.indexOf('天津') < 0) && (recipientAddress2.indexOf('上海') < 0) && (recipientAddress2.indexOf('重庆') < 0)) {
                recipientAddress.push(recipientAddress1)
            }
            if (recipientAddress2) {
                recipientAddress.push(recipientAddress2)
            }
            if (recipientAddress3) {
                recipientAddress.push(recipientAddress3)
            }
            let _recipientAddress4 = recipientAddress4
            recipientAddress.forEach(item => {
                if (_recipientAddress4.indexOf(item) === 0) {
                    _recipientAddress4 = _recipientAddress4.slice(0 + item.length).trim()
                }
            })
            recipientAddress.push(_recipientAddress4)
            orderMap[num] = {
                branchNumber,
                lineNumber,
                saveSender: saveSender === '是',
                senderName,
                senderCellphoneNumber: formatCanadaCellphoneNumber(senderCellphoneNumber),
                senderIdNumber,
                senderAddress,
                saveRecipient: saveRecipient === '是',
                recipientName,
                recipientCellphoneNumber: formatChinaCellphoneNumber(recipientCellphoneNumber),
                recipientIdNumber,
                recipientAddress,
                isSendMessage: isSendMessage === '是',
                remark,
                coverage: _coverage,
                isValueDeclared: !!_coverage,
                isAgreeToInsuranceClause: isAgreeToInsuranceClause === '是',
                isAgreeToForwardingClause: isAgreeToForwardingClause === '是',
                orderGoods: [orderGood]
            }
        }
    }

    for (const key in orderMap) {
        const order = orderMap[key]
        try {
            if (!order.branchNumber) {
                throw new Error(`网点编码不能为空`)
            }
            if (!order.lineNumber) {
                throw new Error(`线路编码不能为空`)
            }
            if (!order.senderName) {
                throw new Error(`发件人姓名不能为空`)
            }
            if (!order.senderCellphoneNumber) {
                throw new Error(`发件人手机号码不能为空`)
            }
            if (order.senderCellphoneNumber.length !== 10) {
                throw new Error(`发件人手机号码有误，请填入正确的加拿大手机号码`)
            }
            if (order.senderAddress.length < 3) {
                throw new Error(`发件人地址有误`)
            }
            if (!order.recipientName) {
                throw new Error(`收件人姓名不能为空`)
            }
            if (order.recipientIdNumber && !identityCodeValid(order.recipientIdNumber)) {
                throw new Error(`收件人身份证号码校验不通过`)
            }
            if (!order.recipientCellphoneNumber) {
                throw new Error(`收件人手机号码不能为空`)
            }
            if (order.recipientCellphoneNumber.length !== 11) {
                throw new Error(`收件人手机号码有误，请填入正确的中国大陆手机号码`)
            }
            if (order.recipientAddress.length < 3) {
                throw new Error(`收件人地址有误`)
            }
            const branch = await Branch.findOne({
                branchNumber: order.branchNumber,
                status: 0
            }).populate([
                { path: 'lineList' }
            ])
            if (!branch) {
                throw new Error(`不存在编码为${order.branchNumber}的网点`)
            }
            let line
            for (const key in branch.lineList) {
                if (branch.lineList[key].lineNumber === order.lineNumber) {
                    line = branch.lineList[key]
                }
            }
            if (!line) {
                throw new Error(`线路${order.lineNumber}不存在或网点${order.branchNumber}没有经营该线路`)
            }
            if (order.isValueDeclared && !line.isSupportValueDeclared) {
                throw new Error(`该线路不支持附加保价金额`)
            }
            if (order.coverage && !(/^\d+$/.test(order.coverage))) {
                throw new Error(`附加保额必须为大于等于0的整数`)
            }
            if (order.isValueDeclared && !order.isAgreeToInsuranceClause) {
                throw new Error(`增加附加保额必须同意保险条款才能新增`)
            }
            if (!order.isAgreeToForwardingClause) {
                throw new Error(`必须同意各项服务条款才能新增`)
            }
            await Promise.all(order.orderGoods.map(async orderGood => {
                if (!orderGood.name) {
                    throw new Error(`物品名称不能为空`)
                }
                if (!orderGood.valueDeclared) {
                    throw new Error(`申报单价不能为空`)
                }
                if (!orderGood.measurementUnit) {
                    throw new Error(`规格不能为空`)
                }
                if (!orderGood.quantity) {
                    throw new Error(`数量不能为空`)
                }
                const exp1 = /^([1-9][\d]{0,7}|0)(\.[\d]{1,2})?$/
                const exp2 = /^\d+(?=\.{0,1}\d+$|$)/
                if (!exp1.test(orderGood.valueDeclared)) {
                    throw new Error('请填入正确的物品申报单价(大于0且小数点后不超过2位)')
                }
                if (!exp2.test(orderGood.quantity)) {
                    throw new Error('请填入正确的物品数量(大于0)')
                }
            }))
            const { senderId, recipientId } = await saveContact(order, reqUserId)
            order.recipientIdCardPositiveImg = null
            order.recipientIdCardBackImg = null
            try {
                const personInfo = await personInfoService.getPersonInfo(order.recipientName, order.recipientCellphoneNumber, order.recipientIdNumber)
                order.recipientIdNumber = personInfo.idNumber
                order.recipientIdCardPositiveImg = personInfo.idCardPositiveImg
                order.recipientIdCardBackImg = personInfo.idCardBackImg
            } catch (e) {
                console.log(e.message)
                personInfoService.updatePersonInfo({
                    name: order.recipientName,
                    cellphoneNumber: order.recipientCellphoneNumber,
                    idNumber: order.recipientIdNumber,
                    idCardPositiveImg: order.recipientIdCardPositiveImg,
                    idCardBackImg: order.recipientIdCardBackImg
                }).catch(e => console.log(e.message))
            }
            const result = await new Order({
                ...order,
                orderNumber: await generateNumber(branch.simpleCode || 0, Order, 'orderNumber', true),
                state: 10,
                line: line._id,
                branch: branch._id,
                tariffType: line.tariffType,
                creator: reqUserId,
                account: reqUserId,
                senderId,
                recipientId,
                orderGoods: await Promise.all(order.orderGoods.map(
                    orderGoods => new OrderGoods(
                        extendByKey({ creator: reqUserId }, orderGoods, ['name', 'brand', 'measurementUnit', 'quantity', 'valueDeclared'])
                    ).save()
                )),
                valueDeclaredRate: line.valueDeclaredRate,
                defaultCoverage: line.defaultCoverage,
                premium: ((Number(order.coverage) * Number(line.valueDeclaredRate)).toFixed(2))
            }).save()

            new ShipmentDetail({
                order: result._id,
                information: '运单' + result.orderNumber + '已建立，等待收件[Canada]',
                creator: reqUserId
            }).save().catch(error => console.log(error))
            console.log(`导入第${key}个运单成功，运单号${result.orderNumber}，id${result._id}`)
            r(key, 'success', `导入第${key}个运单成功，运单号${result.orderNumber}`)
        } catch (err) {
            r(key, 'error', err.message)
            console.log(`导入第${key}个运单错误：`, err.message)
            if (ignoreError === 'false') {
                break
            }
        }
    }

    function r (num, type, message) {
        result.push({
            type: type,
            num: num,
            message: message
        })
    }

    return result
}
