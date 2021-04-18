
import { Router } from 'express'
import UUID from 'uuid'
import xlsx from 'node-xlsx'
import multer from 'multer'
import iconv from 'iconv-lite'

import { Order, ShipmentDetail, OrderGoods, Pallet, ExpressCompany, Branch$PriceType, PriceType, Branch, BranchCustomPrice, UserPriceType, UserBranchCustomPrice } from '../../models'

import * as orderService from '../../services/order'
import * as smsService from '../../services/sms'
import * as permissionService from '../../services/permission'
import * as goldjet from '../../tools/goldjet'

import * as personInfoService from '../../services/personInfo'
import * as shipmentDetailService from '../../services/shipmentDetail'

import { wrap, extendByKey, trimObject } from '../../tools/util'
import { tariffPayByBalance, countWeightGroupByPallet, countAmountWithoutTariffGroupByPallet, countFreightGroupByPallet, countMaterialCostGroupByPallet, countPremiumGroupByPallet, countTariffGroupByPallet, countTariffCNYGroupByPallet } from '../../tools/orderutil'
import { formatOrderDataForXlsx, formatPalletDataForXlsx } from '../../tools/xlsxFormat'
import { queryList, queryList2, convertObjectIdToString } from '../../tools/dbutil'
import redisClient from '../../tools/redis'
import generateNumber from '../../tools/generateNumber'

const upload = multer({
    limits: {
        fileSize: 1024 * 1024 * 10 // 10m
    }
})

const router = Router()
const filterableKeys = ['state', 'pallet', 'account']
const addableKeys = ['line', 'branch', 'senderName', 'senderCellphoneNumber', 'senderAddress', 'senderIdNumber',
    'recipientName', 'recipientCellphoneNumber', 'recipientAddress', 'recipientIdNumber', 'recipientIdCardPositiveImg', 'recipientIdCardBackImg', 'remark', 'coverage', 'premium']

// 获取当前店铺订单
router.get('/orders', wrap(async req => {
    await permissionService.validatePermission(req, '02_01')
    trimObject(req.query)
    const query = extendByKey({
        status: 0,
        branch: req.session.currentBranchId
        // $and: [{ $or: [
        //     { branch: req.session.currentBranchId },
        //     { palletBranch: req.session.currentBranchId }
        // ]}]
    }, req.query, filterableKeys)
    if (query.state === 'ALL' || query.state === 'all') {
        delete query.state
    }
    if (query.state === '-10-90') {
        query.state = {$gt: 10, $lt: 90}
    }
    if (req.query.mixSearch) {
        query.$or = [
            { orderNumber: new RegExp(req.query.mixSearch, 'i') },
            { transhipmentExpressNumber: new RegExp(req.query.mixSearch, 'i') },
            { recipientName: new RegExp(req.query.mixSearch, 'i') }
        ]
    } else {
        if (req.query.orderNumber) {
            query.orderNumber = new RegExp(req.query.orderNumber, 'i')
        }
        if (req.query.transhipmentExpressNumber) {
            query.transhipmentExpressNumber = new RegExp(req.query.transhipmentExpressNumber, 'i')
        }
        if (req.query.recipientName) {
            query.recipientName = new RegExp(req.query.recipientName, 'i')
        }
        if (req.query.recipientCellphoneNumber) {
            query.recipientCellphoneNumber = new RegExp(req.query.recipientCellphoneNumber, 'i')
        }
        if (req.query.recipientIdNumber) {
            query.recipientIdNumber = new RegExp(req.query.recipientIdNumber, 'i')
        }
        if (req.query.line) {
            query.line = req.query.line
        }
        if (req.query.isPrinted) {
            query.isPrinted = req.query.isPrinted
        }
        if (req.query.createTimeStart && req.query.createTimeEnd) {
            query.createTime = {$gt: req.query.createTimeStart, $lt: req.query.createTimeEnd}
        }
        if (req.query.weighingTimeStart && req.query.weighingTimeEnd) {
            query.weighingTime = {$gt: req.query.weighingTimeStart, $lt: req.query.weighingTimeEnd}
        }
        if (req.query.goodsName) {
            const orderGoods = await OrderGoods.find({ name: new RegExp(req.query.goodsName, 'i') }, { _id: 1 })
            query.orderGoods = {$in: orderGoods.map(item => item._id)}
        }
    }

    const result = await queryList2(Order, req, {
        query,
        sort: { createTime: -1 },
        populate: [
            { path: 'line', select: ['name', 'lineNumber'] },
            { path: 'branch', select: 'name' },
            { path: 'orderGoods' },
            { path: 'transhipmentExpressCompany', select: 'name' },
            { path: 'account', select: ['username'] }
        ]
    })
    return result
}))

// 根据当前店铺托盘获取订单
router.get('/orders/getOrdersByPalletId/:palletId', wrap(async req => {
    trimObject(req.query)
    const pallet = await Pallet.findById(req.params.palletId)
    if (!pallet || pallet.branch.toString() !== req.session.currentBranchId) throw new Error('palletId不存在或托盘不属于该网点')
    const query = extendByKey({
        status: 0,
        pallet
    }, req.query, ['state', 'account'])
    if (query.state === 'ALL' || query.state === 'all') {
        delete query.state
    }
    if (query.state === '-10-90') {
        query.state = {$gt: 10, $lt: 90}
    }
    if (req.query.mixSearch) {
        query.$or = [
            { orderNumber: new RegExp(req.query.mixSearch, 'i') },
            { transhipmentExpressNumber: new RegExp(req.query.mixSearch, 'i') },
            { recipientName: new RegExp(req.query.mixSearch, 'i') }
        ]
    } else {
        if (req.query.orderNumber) {
            query.orderNumber = new RegExp(req.query.orderNumber, 'i')
        }
        if (req.query.transhipmentExpressNumber) {
            query.transhipmentExpressNumber = new RegExp(req.query.transhipmentExpressNumber, 'i')
        }
        if (req.query.recipientName) {
            query.recipientName = new RegExp(req.query.recipientName, 'i')
        }
        if (req.query.recipientCellphoneNumber) {
            query.recipientCellphoneNumber = new RegExp(req.query.recipientCellphoneNumber, 'i')
        }
        if (req.query.recipientIdNumber) {
            query.recipientIdNumber = new RegExp(req.query.recipientIdNumber, 'i')
        }
        if (req.query.line) {
            query.line = req.query.line
        }
        if (req.query.isPrinted) {
            query.isPrinted = req.query.isPrinted
        }
        if (req.query.createTimeStart && req.query.createTimeEnd) {
            query.createTime = {$gt: req.query.createTimeStart, $lt: req.query.createTimeEnd}
        }
        if (req.query.weighingTimeStart && req.query.weighingTimeEnd) {
            query.weighingTime = {$gt: req.query.weighingTimeStart, $lt: req.query.weighingTimeEnd}
        }
        if (req.query.goodsName) {
            const orderGoods = await OrderGoods.find({ name: new RegExp(req.query.goodsName, 'i') }, { _id: 1 })
            query.orderGoods = {$in: orderGoods.map(item => item._id)}
        }
    }

    const result = await queryList2(Order, req, {
        query,
        sort: { createTime: -1 },
        populate: [
            { path: 'line', select: ['name', 'lineNumber'] },
            { path: 'branch', select: 'name' },
            { path: 'orderGoods' },
            { path: 'transhipmentExpressCompany', select: 'name' },
            { path: 'account', select: ['username'] }
        ]
    })
    return result
}))

// 打印订单
router.get('/orders/printOrder', wrap(async req => {
    await permissionService.validatePermission(req, '02_05')
    const ids = req.query.ids ? req.query.ids.split(',') : []
    if (ids.length === 0) {
        throw new Error('未选择运单')
    }

    const orders = await Promise.all(ids.map(_id => {
        return Order.findOne({
            _id,
            status: 0
        }).populate([
            { path: 'line', select: ['lineNumber', 'name'] },
            { path: 'account', select: 'username' },
            { path: 'branch', select: 'name' },
            { path: 'orderGoods' }
        ]).exec()
    }))
    orderService.orderPrint(orders.map(o => o._id))
    return orders
}))

// 账单订单
router.get('/orders/printBill', wrap(async req => {
    const ids = req.query.ids ? req.query.ids.split(',') : []
    if (ids.length === 0) {
        throw new Error('未选择运单')
    }

    const orders = await Promise.all(ids.map(_id => {
        return Order.findOne({
            _id,
            status: 0
        }).populate([
            { path: 'line', select: ['lineNumber', 'name'] },
            { path: 'branch', select: 'name' },
            { path: 'orderGoods' }
        ]).exec()
    }))
    await orderService.orderPrint(orders.map(o => o._id))
    return orders
}))

// 手动更新全部物流信息
router.get('/orders/updateAllTrace', wrap(async () => {
    orderService.updateAllTrace()
}))

// 手动更新单个物流信息
router.get('/orders/updateTrace/:orderNumber', wrap(async req => {
    const order = await Order.findOne({orderNumber: req.params.orderNumber, status: 0}, { _id: 1 }).exec()
    if (order) {
        return orderService._orderTrack(order)
    } else {
        throw new Error('不存在该运单')
    }
}))

// 根据托盘导出运单
router.get('/orders/getXlxsByPallet/:palletId', async (req, res) => {
    try {
        const pallet = await Pallet.findOne({_id: req.params.palletId, status: 0}).populate([
            { path: 'lineList', select: ['lineNumber', 'name'] },
            { path: 'branch', select: ['branchNumber', 'name'] },
            { path: 'creator', select: 'username' }
        ]).exec()
        if (!pallet) {
            throw new Error('托盘不存在')
        }
        pallet.orderActualWeight = await countWeightGroupByPallet(pallet._id)
        pallet.orderAmountWithoutTariff = await countAmountWithoutTariffGroupByPallet(pallet._id)
        pallet.orderFreight = await countFreightGroupByPallet(pallet._id)
        pallet.orderMaterialCost = await countMaterialCostGroupByPallet(pallet._id)
        pallet.orderPremium = await countPremiumGroupByPallet(pallet._id)
        pallet.orderTariff = await countTariffGroupByPallet(pallet._id)
        pallet.orderTariffCNY = await countTariffCNYGroupByPallet(pallet._id)
        const orders = await Order.find({ pallet: req.params.palletId, status: 0 }).populate([
            { path: 'line', select: ['lineNumber', 'name'] },
            { path: 'branch', select: ['branchNumber', 'name'] },
            { path: 'pallet', select: 'palletNumber' },
            { path: 'transhipmentExpressCompany', select: 'name' },
            { path: 'weighingOperator', select: 'username' },
            { path: 'paymentOperator', select: 'username' },
            { path: 'tariffPaymentOperator', select: 'username' },
            { path: 'account', select: 'username' },
            { path: 'creator', select: 'username' },
            { path: 'orderGoods' }
        ]).sort({ createTime: -1 }).exec()
        const formatedData = []
        if (req.query.ordersForm) formatedData.push({name: '运单信息', data: await formatOrderDataForXlsx(orders, req.query.ordersForm)})
        if (req.query.palletForm) formatedData.push({name: '托盘信息', data: await formatPalletDataForXlsx(pallet, req.query.palletForm)})
        const fileName = req.query.fileName || `托盘${pallet.palletNumber}`
        if (req.query.type === 'csv') {
            const csvStr = formatedData[0].data.map(row => {
                return row.join(',')
            }).join('\n')
            res.attachment(`${fileName}.csv`)
            res.set('Content-Type', 'text/csv')
            res.send(iconv.encode(csvStr, 'gbk'))
        } else {
            const buffer = xlsx.build(formatedData)
            res.attachment(`${fileName}.xlsx`)
            res.send(buffer)
        }
    } catch (e) {
        console.warn('getXlxsByPallet error ', e)
        res.status(500).send(e.message)
    }
})

// 根据所选运单导出 excel 解决url超长
router.post('/orders/getXlxsByOrderList/:form/:name', async (req, res) => {
    try {
        const orderList = req.body.orderList
        const orders = await Order.find({ _id: {$in: orderList}, status: 0 }).populate([
            { path: 'line', select: ['lineNumber', 'name'] },
            { path: 'branch', select: ['branchNumber', 'name'] },
            { path: 'pallet', select: 'palletNumber' },
            { path: 'transhipmentExpressCompany', select: 'name' },
            { path: 'weighingOperator', select: 'username' },
            { path: 'paymentOperator', select: 'username' },
            { path: 'tariffPaymentOperator', select: 'username' },
            { path: 'account', select: 'username' },
            { path: 'creator', select: 'username' },
            { path: 'orderGoods' }
        ]).sort({ createTime: -1 }).exec()
        const formatedData = [
            {
                name: '运单信息',
                data: formatOrderDataForXlsx(orders, req.params.form)
            }
        ]
        if (req.query.type === 'csv') {
            const csvStr = formatedData[0].data.map(row => {
                return row.join(',')
            }).join('\n')
            res.attachment(`${req.params.name}.csv`)
            res.set('Content-Type', 'text/csv')
            res.send(iconv.encode(csvStr, 'gbk'))
        } else {
            const buffer = xlsx.build(formatedData)
            res.attachment(`${req.params.name}.xlsx`)
            res.send(buffer)
        }
    } catch (e) {
        console.warn('getXlxsByPallet error ', e)
        res.status(500).send(e.message)
    }
})

// 根据所选运单导出运单
router.get('/orders/getXlxsByOrderList/:form/:name', async (req, res) => {
    try {
        const orderList = JSON.parse(req.query.orderList)
        const orders = await Order.find({ _id: {$in: orderList}, status: 0 }).populate([
            { path: 'line', select: ['lineNumber', 'name'] },
            { path: 'branch', select: ['branchNumber', 'name'] },
            { path: 'pallet', select: 'palletNumber' },
            { path: 'transhipmentExpressCompany', select: 'name' },
            { path: 'weighingOperator', select: 'username' },
            { path: 'paymentOperator', select: 'username' },
            { path: 'tariffPaymentOperator', select: 'username' },
            { path: 'account', select: 'username' },
            { path: 'creator', select: 'username' },
            { path: 'orderGoods' }
        ]).sort({ createTime: -1 }).exec()
        const formatedData = [
            {
                name: '运单信息',
                data: formatOrderDataForXlsx(orders, req.params.form)
            }
        ]
        if (req.query.type === 'csv') {
            const csvStr = formatedData[0].data.map(row => {
                return row.join(',')
            }).join('\n')
            res.attachment(`${req.params.name}.csv`)
            res.set('Content-Type', 'text/csv')
            res.send(iconv.encode(csvStr, 'gbk'))
        } else {
            const buffer = xlsx.build(formatedData)
            res.attachment(`${req.params.name}.xlsx`)
            res.send(buffer)
        }
    } catch (e) {
        console.warn('getXlxsByPallet error ', e)
        res.status(500).send(e.message)
    }
})

// 获取所有订单
router.get('/ordersAll', wrap(async req => {
    const { pageNo, pageSize, mixSearch } = req.query
    const query = extendByKey({ status: 0, branch: req.session.currentBranchId }, req.query, filterableKeys)
    if (query.state === 'ALL' || query.state === 'all' || query.state === '-1') {
        delete query.state
    }
    if (mixSearch) {
        query.$or = [
            { orderNumber: new RegExp(mixSearch, 'i') },
            { senderName: new RegExp(mixSearch, 'i') },
            { senderCellphoneNumber: new RegExp(mixSearch, 'i') },
            { recipientName: new RegExp(mixSearch, 'i') },
            { recipientCellphoneNumber: new RegExp(mixSearch, 'i') }
        ]
    }

    return queryList({
        model: Order,
        query,
        sort: { createTime: -1 },
        populate: [
            { path: 'line', select: 'name' },
            { path: 'branch', select: 'name' },
            { path: 'orderGoods' },
            { path: 'transhipmentExpressCompany', select: 'name' }
        ],
        pageNo: parseInt(pageNo),
        pageSize: parseInt(pageSize)
    })
}))

// 编辑订单
router.post('/orders/:id/edit', wrap(async req => {
    const order = await Order.findOne({ _id: req.params.id })

    if (!order) throw new Error('订单不存在')
    const allowUpdate = [10, 20, 30, 40, 50].includes(order.state)
    if (!allowUpdate) throw new Error('订单已发货，无法修改')

    // 处理发件人收件人保存
    const {senderId, recipientId} = await orderService.saveContact(req.body, order.creator._id)

    // 处理物品信息保存
    const orderGoodsId = await Promise.all(req.body.orderGoods.map(async orderGoods => {
        const result = await new OrderGoods(
            extendByKey({ creator: req.user._id }, orderGoods, ['name', 'brand', 'measurementUnit', 'quantity', 'valueDeclared'])
        ).save()
        orderService.saveOrderGoods(orderGoods, req.user._id)
        return result._id
    }))
    OrderGoods.deleteMany({ _id: {$in: order.orderGoods} }).exec()
    // 保存成功后删除原来的物品信息
    order.orderGoods = orderGoodsId

    order.senderId = senderId
    order.recipientId = recipientId

    extendByKey(order, req.body, addableKeys)
    await order.save()

    console.log('修改订单', order._id)

    shipmentDetailService.addShipmentDetail(`运单${order.orderNumber}信息已更新[Canada]`, order._id, req.user._id)

    personInfoService.updatePersonInfo({
        name: order.recipientName,
        cellphoneNumber: order.recipientCellphoneNumber,
        idNumber: order.recipientIdNumber,
        idCardPositiveImg: order.recipientIdCardPositiveImg,
        idCardBackImg: order.recipientIdCardBackImg
    }).catch(e => console.log(e.message))

    return order
}))

// 称重
router.post('/orders/batchWeigh', wrap(async req => {
    await permissionService.validatePermission(req, '02_02')
    let result = []
    for (const orderNumber of req.body.orderNumberList) {
        try {
            await orderService.orderWeigh(orderNumber, req.body.editForm, req.user._id)
            result.push({ orderNumber: orderNumber, message: '成功' })
        } catch (e) {
            result.push({ orderNumber: orderNumber, message: '失败:' + e.message })
        }
    }
    return result
}))

// 称重
router.post('/orders/:id/weigh', wrap(async req => {
    await permissionService.validatePermission(req, '02_02')
    const weighKeys = ['unitPrice', 'extendedAreaSurcharge', 'actualWeight', 'chargeableWeight', 'poundSurcharge', 'materialCost', 'tariff', 'coverage', 'premium', 'amountWithoutTariff', 'clearance']

    const order = await Order.findById(req.params.id).populate('orderGoods').exec()

    if (!order) {
        throw new Error('订单不存在')
    }

    if ([10, 20].indexOf(order.state) === -1) {
        throw new Error('运单状态不为10,20')
    }

    const oldState = order.state

    if (Number(req.body.premium) > 0) {
        order.isValueDeclared = true
        order.isAgreeToInsuranceClause = true
    } else {
        order.isValueDeclared = false
    }

    const freight = (((Number(req.body.unitPrice) + Number(req.body.extendedAreaSurcharge)) * Number(req.body.chargeableWeight)) + Number(req.body.poundSurcharge)).toFixed(2)
    const standardAmountWithoutTariff = (Number(freight) + Number(req.body.materialCost) + Number(req.body.premium)).toFixed(2)
    const totalAmount = (Number(req.body.amountWithoutTariff) + Number(req.body.tariff)).toFixed(2)

    order.state = 20
    order.freight = freight
    order.standardAmountWithoutTariff = standardAmountWithoutTariff
    order.totalAmount = totalAmount
    order.weighingOperator = req.user._id
    order.weighingTime = new Date()

    extendByKey(order, req.body, weighKeys)

    let getExpressSuccess = false
    let getExpressInfo = '未下单'
    if (req.body.clearance === 20 || req.body.clearance === 21) {
        if (req.body.getExpressByGoldjet) {
            try {
                const data = await goldjet.expressOrder(order.toObject(), req.body.clearance)
                order.transhipmentExpressNumber = data.express_no
                order.transhipmentExpressDestcode = data.destcode
                order.transhipmentExpressCompany = await ExpressCompany.findOne({expressCompanyNumber: 'YTO'})
                getExpressSuccess = true
                getExpressInfo = data.express_no
            } catch (e) {
                console.log('通过接口下单失败', e.message)
                getExpressInfo = e.message
            }
        }
    }

    await order.save()

    if (order.isSendMessage && oldState === 10) {
        smsService.sendIdCardSMS([order.recipientCellphoneNumber], order.orderNumber)
    }

    let information = `运单${order.orderNumber}已揽收[Canada]`
    if (order.transhipmentExpressNumber) information = information + `，分配国内运单号[圆通${order.transhipmentExpressNumber}]`
    new ShipmentDetail({ order: order._id, information, creator: req.user._id }).save()

    return { getExpressSuccess, getExpressInfo, order }
}))

// 根据托盘查询
// router.get('/orders', wrap(async req => {
//     const { pageNo, pageSize, mixSearch } = req.query
//     const query = extendByKey({ status: 0, branch: req.session.currentBranchId }, req.query, filterableKeys)
//     if (query.state === 'ALL' || query.state === 'all' || query.state === '-1') {
//         delete query.state
//     }
//     if (mixSearch) {
//         query.$or = [
//             { orderNumber: new RegExp(mixSearch, 'i') },
//             { senderName: new RegExp(mixSearch, 'i') },
//             { senderCellphoneNumber: new RegExp(mixSearch, 'i') },
//             { recipientName: new RegExp(mixSearch, 'i') },
//             { recipientCellphoneNumber: new RegExp(mixSearch, 'i') }
//         ]
//     }
//     return queryList({
//         model: Order,
//         query,
//         sort: { createTime: -1 },
//         populate: [
//             { path: 'line', select: 'name' },
//             { path: 'branch', select: 'name' },
//             { path: 'orderGoods' },
//             { path: 'transhipmentExpressCompany', select: 'name' }
//         ],
//         pageNo: parseInt(pageNo),
//         pageSize: parseInt(pageSize)
//     })
// }))

// 新增订单
router.post('/orders', wrap(async req => {
    const branch = await Branch.findById(req.body.branch).exec()
    if (!branch) throw new Error('网点不存在')
    const orderNumber = await generateNumber(branch.simpleCode || 0, Order, 'orderNumber', true)
    return new Order(extendByKey({
        orderNumber,
        creator: req.user._id
    }, req.body, addableKeys)).save()
}))

// 批量取消订单
router.post('/orders/cancel', wrap(async req => {
    await permissionService.validatePermission(req, '02_03')
    let orders = await Order.find(
        { _id: req.body.orderList, branch: req.session.currentBranchId, status: 0 },
        { _id: 1, orderNumber: 1, state: 1 }
    )
    let result = []
    await Promise.all(orders.map(async item => {
        try {
            if (item.state !== 10 && item.state !== 20) {
                throw new Error('订单状态不为10或20')
            }
            await Order.updateOne({ _id: item.id }, { $set: { state: 90 } }).exec()
            result.push({ orderNumber: item.orderNumber, message: '取消成功' })
        } catch (e) {
            result.push({ orderNumber: item.orderNumber, message: '取消失败:' + e.message })
        }
    }))
    return result
}))

// 将运单加入托盘
router.post('/orders/setPallet', wrap(async req => {
    const pallet = await Pallet.findOne({ _id: req.body.palletId, status: 0 }, { branch: 1, state: 1, lineList: 1 })
    if (!pallet) {
        throw new Error(`找不到托盘${req.body.palletId}`)
    }
    await orderService.setPallet(pallet, req.body.orderNumber, req.session.currentBranchId)
}))

// 将运单移出托盘
router.post('/orders/removeFromPallet/:orderNumber', wrap(async req => {
    await orderService.removeFromPallet(null, req.params.orderNumber, req.session.currentBranchId)
}))

// 批量装盘移盘
router.post('/orders/batchSetPallet', wrap(async req => {
    let { orderNumbers = [], palletId, type } = req.body
    const pallet = await Pallet.findOne({ _id: palletId, status: 0 }, { branch: 1, state: 1, lineList: 1 })
    if (!pallet) {
        throw new Error(`找不到托盘${palletId}`)
    }
    if (pallet.state !== 10) {
        throw new Error(`托盘状态不为(装盘10)`)
    }
    let result = []
    await Promise.all(orderNumbers.map(async orderNumber => {
        try {
            if (type === '0') {
                await orderService.setPallet(pallet, orderNumber, req.session.currentBranchId)
            }
            if (type === '1') {
                await orderService.removeFromPallet(pallet, orderNumber, req.session.currentBranchId)
            }
            result.push({orderNumber, message: '操作成功'})
        } catch (e) {
            result.push({orderNumber, message: `操作失败(${e.message})`})
        }
    }))
    return result
}))

// 检查运单是否可加入托盘里
router.post('/orders/checkPallet', wrap(async req => {
    const order = await Order.findOne({ orderNumber: req.body.orderNumber, status: 0 }, { state: 1, branch: 1, pallet: 1, line: 1 })
    const pallet = await Pallet.findOne({ _id: req.body.palletId, status: 0 }, { branch: 1, state: 1, lineList: 1 })
    if (!order) {
        throw new Error(`运单${req.body.orderNumber}不存在`)
    }
    if (!pallet) {
        throw new Error(`找不到托盘${req.body.palletId}`)
    }
    await orderService.checkOrderSetPallet(pallet, order, req.session.currentBranchId)
}))

// 订单付款
router.post('/orders/pay', wrap(async req => {
    await permissionService.validatePermission(req, '02_07')
    if (!req.body.paymentMethod) {
        throw new Error('支付方式为空')
    }
    const progressId = UUID.v4()
    await redisClient.set(`progressId:${progressId}`, JSON.stringify({ percentage: 1 }), 'EX', 86400)
    orderService.batchPay(req.body.orderIdList, req.body.paymentMethod, req.body.controlType, progressId, req.user._id)
    return progressId
}))

// 关税付款
router.post('/orders/payTariff', wrap(async req => {
    await permissionService.validatePermission(req, '02_07')
    const orders = await Order.find(
        { _id: req.body.orderIdList, status: 0 },
        { _id: 1, orderNumber: 1 }
    )
    if (!req.body.paymentMethod) {
        throw new Error('支付方式为空')
    }
    let result = []
    for (var index in orders) {
        try {
            if (req.body.paymentMethod === '30') {
                await tariffPayByBalance(orders[index]._id, req.user._id)
            } else {
                throw new Error('请选择正确支付方式')
            }
            result.push({ orderNumber: orders[index].orderNumber, message: '付款成功' })
        } catch (e) {
            result.push({ orderNumber: orders[index].orderNumber, message: '付款失败:' + e.message })
        }
    }
    return result
}))

// 取消订单
router.post('/orders/:id/cancel', wrap(async req => {
    await permissionService.validatePermission(req, '02_03')
    const order = await Order.findOne({ _id: req.params.id, status: 0, branch: req.session.currentBranchId }, { state: 1, _id: 0 }).exec()
    if (order.state === 10) {
        await Order.updateOne({ _id: req.params.id }, { $set: { state: 90 } }).exec()
    } else {
        throw new Error(`${req.params.id}状态不为(10)`)
    }
}))

// 更新状态(70/80)
router.post('/orders/updateState', wrap(async req => {
    const orders = await Order.find({ _id: req.body.orderIdList, status: 0 })
    let result = []
    for (var index in orders) {
        try {
            await orderService.updateOrderState(orders[index], req.body.state, req.user._id)
            result.push({ orderNumber: orders[index].orderNumber, message: '更新成功' })
        } catch (e) {
            result.push({ orderNumber: orders[index].orderNumber, message: '更新失败:' + e.message })
        }
    }
    return result
}))

// 订单入库
router.post('/orders/storage', wrap(async req => {
    await permissionService.validatePermission(req, '02_06')
    return orderService.storage(req.body.orderIdList, req.user._id)
}))

// 订单取消入库
router.post('/orders/cancelStorage', wrap(async req => {
    await permissionService.validatePermission(req, '02_06')
    return orderService.cancelStorage(req.body.orderIdList, req.user._id)
}))

// 更加运单跟踪信息
router.post('/orders/addShipmentDetail', wrap(async req => {
    await permissionService.validatePermission(req, '02_04')
    for (var index in req.body.orderIdList) {
        try {
            new ShipmentDetail({
                order: req.body.orderIdList[index],
                information: req.body.information,
                creator: req.user._id
            }).save()
        } catch (error) {
            console.warn(error)
        }
    }
}))

// 订单匹配
router.post('/orders/match', upload.single('file'), wrap(async req => {
    await permissionService.validatePermission(req, '03_01')
    if (!req.file) {
        throw new Error('文件不存在')
    }
    const workbook = xlsx.parse(req.file.buffer, { type: 'buffer' })
    const data = workbook[0].data.slice(1) // 去掉头可以吃
    return orderService.orderMatch(data, {
        user: req.user,
        branchId: req.session.currentBranchId,
        cover: req.body.cover === 'true' // 是否覆盖
    })
}))

// 填写关税
router.post('/orders/:id/tariff', wrap(async req => {
    await permissionService.validatePermission(req, '04_09')
    const editableKeys = ['tariffCNY']
    return Order.updateOne({ _id: req.params.id, tariffType: 0, tariffState: { $in: [0, 1, 2] } }, { $set: extendByKey({ tariffState: 2, state: 65 }, req.body, editableKeys) }).exec()
}))

// 无关税
router.post('/orders/:id/noTariff', wrap(async req => {
    await permissionService.validatePermission(req, '04_09')
    const order = await Order.findOne({ _id: req.params.id, tariffType: 0, tariffState: { $in: [0, 1, 2] } }).exec()
    if (!order) {
        throw new Error('运单状态不符')
    }
    if (order.knState === '0') {
        return Order.updateOne({ _id: req.params.id, tariffType: 0, tariffState: { $in: [0, 1, 2] } }, { $set: { tariffCNY: 0, tariffState: 1, state: 60 } }).exec()
    } else if (order.knState === '3') {
        return Order.updateOne({ _id: req.params.id, tariffType: 0, tariffState: { $in: [0, 1, 2] } }, { $set: { tariffCNY: 0, tariffState: 1, state: 80 } }).exec()
    } else {
        return Order.updateOne({ _id: req.params.id, tariffType: 0, tariffState: { $in: [0, 1, 2] } }, { $set: { tariffCNY: 0, tariffState: 1, state: 70 } }).exec()
    }
}))

// 未付订单
router.get('/orders/countFreightNotPaid', wrap(async req => {
    await permissionService.validatePermission(req, '05_01')
    const result = await Order.aggregate([{ $match: { state: 20, status: 0 } }, { $group: { _id: 'countFreightNotPaid', value: { $sum: '$totalAmount' } } }])
    return result[0] ? result[0].value : 0
}))

// 未付关税
router.get('/orders/countTariffNotPaid', wrap(async req => {
    await permissionService.validatePermission(req, '05_01')
    const result = await Order.aggregate([{ $match: { state: 65, status: 0 } }, { $group: { _id: 'countTariffNotPaid', value: { $sum: '$tariffCNY' } } }])
    return result[0] ? result[0].value : 0
}))

// 订单详情 校验当前店铺 称重使用
router.get('/orders/weigh/:orderNumber', wrap(async req => {
    let order = await Order.findOne({
        orderNumber: req.params.orderNumber,
        state: { $in: [10, 20] },
        status: 0
    }).populate([
        { path: 'account', select: 'username' },
        { path: 'line', select: 'name' },
        { path: 'branch', select: 'name' },
        { path: 'orderGoods' },
        { path: 'transhipmentExpressCompany', select: 'name' }
    ]).exec()
    if (!order) {
        throw new Error(`不存在该订单或该订单状态不符`)
    }
    if (order.branch._id.toString() !== req.session.currentBranchId) {
        throw new Error(`订单不属于当前店铺`)
    }
    order = order.toObject()
    const userId = order.account._id
    const lineId = order.line._id
    const branchId = order.branch._id

    const [
        priceTypes,
        branchCustomPrices
    ] = await Promise.all([
        await PriceType.find({ line: lineId, status: 0 }),
        await BranchCustomPrice.find({ line: lineId, branch: branchId, status: 0 })
    ])

    const branch$PriceTypes = await Branch$PriceType.find({ branch: order.branch._id, priceType: { $in: priceTypes }, status: 0 }).populate([
        { path: 'priceType', select: ['name', '_id'] }
    ])

    const userPriceTypes = await UserPriceType.find({ user: userId, priceType: { $in: priceTypes } }).populate([
        { path: 'priceType', select: ['name', '_id'] }
    ])

    const userCustomPrices = await UserBranchCustomPrice.find({ user: userId, branchCustomPrice: { $in: branchCustomPrices } }).populate([
        { path: 'branchCustomPrice', select: ['name', '_id'] }
    ])

    const formatNumber = (first, second, last = 0) => {
        if (typeof first === 'number') {
            return first
        }
        return second || last
    }

    const compareId = (id1, id2) => {
        return convertObjectIdToString(id1) === convertObjectIdToString(id2)
    }

    const regularPriceTypes = branch$PriceTypes.filter(f => f.unitPrice).map(item => {
        const userItem = userPriceTypes.find(userPrice => compareId(userPrice.priceType._id, item.priceType._id)) || {}

        const unitPrice = formatNumber(userItem.unitPrice, item.unitPrice)
        const poundSurcharge = formatNumber(userItem.poundSurcharge, item.poundSurcharge)
        const startingWeight = formatNumber(userItem.startingWeight, item.startingWeight)
        return {
            name: item.priceType.name,
            unitPrice,
            poundSurcharge,
            startingWeight,
            _id: item._id
        }
    })

    const customPriceTypes = branchCustomPrices.filter(f => f.unitPrice && f.name).map(item => {
        const userItem = userCustomPrices.find(userPrice => compareId(userPrice.branchCustomPrice._id, item._id)) || {}

        const unitPrice = formatNumber(userItem.unitPrice, item.unitPrice)
        const poundSurcharge = formatNumber(userItem.poundSurcharge, item.poundSurcharge)
        const startingWeight = formatNumber(userItem.startingWeight, item.startingWeight)
        return {
            name: item.name,
            unitPrice,
            poundSurcharge,
            startingWeight,
            _id: item._id
        }
    })

    order.priceTypes = [...regularPriceTypes, ...customPriceTypes]
    return order
}))

// 订单详情 校验当前店铺 批量称重使用
router.get('/orders/batchWeigh', wrap(async req => {
    const orderNumberList = req.query.orderNumberList.split(',')

    let orders = await Order.find({
        orderNumber: orderNumberList,
        state: { $in: [10, 20] },
        status: 0
    }).populate([
        { path: 'account', select: 'username' },
        { path: 'line', select: 'name' },
        { path: 'branch', select: 'name' },
        { path: 'orderGoods' },
        { path: 'transhipmentExpressCompany', select: 'name' }
    ]).exec()
    orders = orders.map(order => order.toObject())
    return orders
}))

// 获取单个订单详情
router.get('/orders/:id', wrap(async req => {
    return Order.findOne({
        _id: req.params.id,
        status: 0,
        $or: [
            { branch: req.session.currentBranchId },
            { palletBranch: req.session.currentBranchId }
        ]
    }).populate([
        { path: 'line', select: 'name' },
        { path: 'pallet', select: 'palletNumber' },
        { path: 'branch', select: 'name' },
        { path: 'orderGoods' },
        { path: 'transhipmentExpressCompany', select: 'name' },
        { path: 'weighingOperator', select: 'username' },
        { path: 'paymentOperator', select: 'username' },
        { path: 'tariffPaymentOperator', select: 'username' },
        { path: 'account', select: 'username' },
        { path: 'creator', select: 'username' }
    ])
}))

export default router
