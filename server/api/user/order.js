
import { Router } from 'express'
import xlsx from 'node-xlsx'
import multer from 'multer'
import iconv from 'iconv-lite'

import { Order, OrderGoods, Line, User, Branch } from '../../models'

import * as orderService from '../../services/order'
import * as personInfoService from '../../services/personInfo'
import * as shipmentDetailService from '../../services/shipmentDetail'

import { wrap, extendByKey } from '../../tools/util'
import { queryList2 } from '../../tools/dbutil'
import { formatOrderDataForXlsx } from '../../tools/xlsxFormat'
import generateNumber from '../../tools/generateNumber'

const upload = multer({
    limits: {
        fileSize: 1024 * 1024 * 10 // 10m
    }
})

const router = Router()
const filterableKeys = ['state']
const addableKeys = ['branch', 'line', 'saveSender', 'senderName', 'senderCellphoneNumber', 'senderIdNumber', 'senderAddress', 'saveRecipient', 'recipientName', 'recipientCellphoneNumber', 'recipientIdNumber', 'recipientAddress', 'isSendMessage', 'recipientIdCardPositiveImg', 'recipientIdCardBackImg', 'remark', 'coverage', 'premium', 'isValueDeclared', 'valueDeclaredRate', 'defaultCoverage', 'isAgreeToInsuranceClause', 'isAgreeToForwardingClause']
const stateName2Query = (query, state) => {
    if (state === 'SH') {
        query.state = { $in: [10] }
    // } else if (state === 'FK') {
    //     query.state = { $in: [20, 65] }
    } else if (state === 'DF') {
        query.state = { $in: [20, 30, 40] }
    } else if (state === 'YF') {
        query.state = { $in: [50, 60, 65] }
    } else if (state === 'PS') {
        query.state = { $in: [70] }
    } else if (state === 'QS') {
        query.state = { $in: [80] }
    } else if (state === 'QB') {
        query.state = { $lt: 90 }
    } else if (state === 'QX') {
        query.state = { $in: [90] }
    }
    return query
}

// 获取我的订单
router.get('/orders', wrap(async req => {
    const query = extendByKey({ status: 0, creator: req.user._id }, req.query, filterableKeys)
    stateName2Query(query, query.state)
    if (req.query.mixSearch) {
        query.$or = [
            { orderNumber: new RegExp(req.query.mixSearch, 'i') },
            { transhipmentExpressNumber: new RegExp(req.query.mixSearch, 'i') },
            { recipientName: new RegExp(req.query.mixSearch, 'i') },
            { recipientCellphoneNumber: new RegExp(req.query.mixSearch, 'i') }
        ]
    } else {
        if (req.query.orderNumber) {
            query.orderNumber = new RegExp(req.query.orderNumber)
        }
        if (req.query.transhipmentExpressNumber) {
            query.transhipmentExpressNumber = new RegExp(req.query.transhipmentExpressNumber)
        }
        if (req.query.recipientName) {
            query.recipientName = new RegExp(req.query.recipientName)
        }
        if (req.query.recipientCellphoneNumber) {
            query.recipientCellphoneNumber = new RegExp(req.query.recipientCellphoneNumber)
        }
        if (req.query.recipientIdNumber) {
            query.recipientIdNumber = new RegExp(req.query.recipientIdNumber)
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
            const orderGoods = await OrderGoods.find({ name: new RegExp(req.query.goodsName) }, { _id: 1 })
            query.orderGoods = {$in: orderGoods.map(item => item._id)}
        }
    }
    return queryList2(Order, req, {
        query,
        sort: { createTime: -1 },
        populate: [
            { path: 'line', select: ['lineNumber', 'name'] },
            { path: 'branch', select: 'name' },
            { path: 'orderGoods' },
            { path: 'transhipmentExpressCompany', select: 'name' }
        ]
    })
}))

// 根据所选运单导出运单
router.get('/orders/getXlxsByOrderList/:form/:name', async (req, res) => {
    try {
        const orderList = JSON.parse(req.query.orderList)
        const orders = await Order.find({ _id: {$in: orderList}, status: 0, creator: req.user._id }).populate([
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

// 根据所选运单导出运单, 解决url过长
router.post('/orders/getXlxsByOrderList/:form/:name', async (req, res) => {
    try {
        const orderList = req.body.orderList
        const orders = await Order.find({ _id: {$in: orderList}, status: 0, creator: req.user._id }).populate([
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

// 订单统计
router.get('/orders/stat', wrap(async req => {
    const result = {}
    await Promise.all(['SH', 'DF', 'YF', 'PS', 'QS', 'QB', 'QX'].map(async key => {
        result[key] = await Order.countDocuments(stateName2Query({
            status: 0,
            creator: req.user._id
        }, key))
    }))
    return result
}))

// 打印订单
router.get('/orders/printOrder', wrap(async req => {
    const ids = req.query.ids ? req.query.ids.split(',') : []
    if (ids.length === 0) {
        throw new Error('未选择运单')
    }

    const orders = await Promise.all(ids.map(_id => {
        return Order.findOne({
            _id,
            status: 0,
            creator: req.user._id
        }).populate([
            { path: 'line', select: ['lineNumber', 'name'] },
            { path: 'account', select: 'username' },
            { path: 'branch', select: 'name' },
            { path: 'orderGoods' }
        ]).exec()
    }))

    await orderService.orderPrint(orders.map(o => o._id))

    return orders
}))

// 获取单个订单详情
router.get('/orders/:id', wrap(async req => {
    return Order.findOne({
        _id: req.params.id,
        status: 0,
        creator: req.user._id
    }).populate([
        { path: 'line', select: 'name' },
        { path: 'branch', select: 'name' },
        { path: 'orderGoods' },
        { path: 'transhipmentExpressCompany', select: 'name' }
    ]).exec()
}))

// 批量导入运单
router.post('/orders/import', upload.single('file'), wrap(async req => {
    return orderService.orderImport(req.file, req.body.ignoreError, req.user._id)
}))

// 批量取消订单
router.post('/orders/restore', wrap(async req => {
    let orders = await Order.find(
        { _id: req.body.orderList, creator: req.user._id, status: 0 },
        { _id: 1, orderNumber: 1, state: 1 }
    )
    let result = []
    await Promise.all(orders.map(async item => {
        try {
            if (item.state !== 90) {
                throw new Error('订单状态不为90')
            }
            await Order.updateOne({ _id: item.id }, { $set: { state: 10 } }).exec()
            result.push({ orderNumber: item.orderNumber, message: '恢复成功' })
        } catch (e) {
            result.push({ orderNumber: item.orderNumber, message: '恢复失败:' + e.message })
        }
    }))
    return result
}))

// 批量取消订单
router.post('/orders/cancel', wrap(async req => {
    let orders = await Order.find(
        { _id: req.body.orderList, creator: req.user._id, status: 0 },
        { _id: 1, orderNumber: 1, state: 1 }
    )
    let result = []
    await Promise.all(orders.map(async item => {
        try {
            if (item.state !== 10) {
                throw new Error('订单状态不为10')
            }
            await Order.updateOne({ _id: item.id }, { $set: { state: 90 } }).exec()
            result.push({ orderNumber: item.orderNumber, message: '取消成功' })
        } catch (e) {
            result.push({ orderNumber: item.orderNumber, message: '取消失败:' + e.message })
        }
    }))
    return result
}))

// 取消订单
router.post('/orders/:id/cancel', wrap(async req => {
    const order = await Order.findOne({_id: req.params.id, status: 0, creator: req.user._id}, { state: 1, _id: 0 }).exec()
    if (order.state === 10) {
        await Order.updateOne({ _id: req.params.id }, { $set: { state: 90 } }).exec()
    } else {
        throw new Error(`${req.params.id}状态不为(10)`)
    }
}))

// 修改订单
router.post('/orders/:id', wrap(async req => {
    if (req.body.orderGoods.length < 1) throw new Error('物品信息不能为空')

    const [user, order, line] = await Promise.all([
        User.findOne({ _id: req.user._id, status: 0, isAdmin: false }, { _id: 1 }),
        Order.findOne({ _id: req.params.id, creator: req.user._id, status: 0 }),
        Line.findOne({ _id: req.body.line, status: 0 }, { tariffType: 1 })
    ])

    if (!user) throw new Error(`不存在该用户或该用户已禁用`)
    if (!order || !line) throw new Error('订单不存在')
    if (order.state !== 10) throw new Error('订单已发货，无法修改')

    // 处理发件人收件人保存
    const {senderId, recipientId} = await orderService.saveContact(req.body, req.user._id)

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

    order.tariffType = line.tariffType
    order.senderId = senderId
    order.recipientId = recipientId

    // 自动从库中带出身份信息
    // if (!req.body.recipientIdCardPositiveImg && !req.body.recipientIdCardBackImg) {
    //     try {
    //         const personInfo = await personInfoService.getPersonInfo(req.body.recipientName, req.body.recipientCellphoneNumber, req.body.recipientIdNumber)
    //         req.body.recipientIdNumber = personInfo.idNumber
    //         req.body.recipientIdCardPositiveImg = personInfo.idCardPositiveImg
    //         req.body.recipientIdCardBackImg = personInfo.idCardBackImg
    //     } catch (e) {
    //         console.log(e.message)
    //     }
    // }

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

// 新增订单
router.post('/orders', wrap(async req => {
    const user = await User.findOne({ _id: req.user._id, status: 0, isAdmin: false }, { _id: 1 })
    if (!user) throw new Error(`不存在该用户或该用户已禁用`)

    if (req.body.orderGoods.length < 1) throw new Error('物品信息不能为空')
    const branch = await Branch.findById(req.body.branch).exec()
    if (!branch) throw new Error('网点不存在')
    const orderNumber = await generateNumber(branch.simpleCode || 0, Order, 'orderNumber', true)
    const line = await Line.findOne({ _id: req.body.line, status: 0 }, { tariffType: 1 })
    const {senderId, recipientId} = await orderService.saveContact(req.body, req.user._id)

    // 处理物品信息保存
    const orderGoodsId = await Promise.all(req.body.orderGoods.map(async orderGoods => {
        const result = await new OrderGoods(
            extendByKey({ creator: req.user._id }, orderGoods, ['name', 'brand', 'measurementUnit', 'quantity', 'valueDeclared'])
        ).save()
        orderService.saveOrderGoods(orderGoods, req.user._id)
        return result._id
    }))

    // 自动从库中带出身份信息
    // if (!req.body.recipientIdCardPositiveImg && !req.body.recipientIdCardBackImg) {
    //     try {
    //         const personInfo = await personInfoService.getPersonInfo(req.body.recipientName, req.body.recipientCellphoneNumber, req.body.recipientIdNumber)
    //         req.body.recipientIdNumber = personInfo.idNumber
    //         req.body.recipientIdCardPositiveImg = personInfo.idCardPositiveImg
    //         req.body.recipientIdCardBackImg = personInfo.idCardBackImg
    //     } catch (e) {
    //         console.log(e.message)
    //     }
    // }

    const order = await new Order(
        extendByKey(
            {
                orderNumber,
                state: 10,
                creator: req.user._id,
                account: req.user._id,
                orderGoods: orderGoodsId,
                tariffType: line.tariffType,
                senderId: senderId,
                recipientId: recipientId
            },
            req.body,
            addableKeys
        )).save()

    console.log('新增订单', order._id)

    shipmentDetailService.addShipmentDetail(`运单${order.orderNumber}已建立，等待收件[Canada]`, order._id, req.user._id)

    personInfoService.updatePersonInfo({
        name: order.recipientName,
        cellphoneNumber: order.recipientCellphoneNumber,
        idNumber: order.recipientIdNumber,
        idCardPositiveImg: order.recipientIdCardPositiveImg,
        idCardBackImg: order.recipientIdCardBackImg
    }).catch(e => console.log(e.message))

    return order
}))

export default router
