
import { Router } from 'express'
import { wrap } from '../tools/util'
import { queryList } from '../tools/dbutil'

import Order from '../models/order'
import Contacts from '../models/contacts'

import * as orderService from '../services/order'
import * as kdniaoService from '../services/kdniao'
import * as personInfoService from '../services/personInfo'

const router = Router()

// // 证件上传运单查询
// router.get('/order/search', wrap(async req => {
//     // const query = extendByKey({ status: 0 }, req.query, filterableKeys)
//     const query = { status: 0, recipientIdNumber: req.query.recipientIdNumber, recipientCellphoneNumber: req.query.recipientCellphoneNumber }
//     return queryList({
//         model: Order,
//         query,
//         sort: { createTime: -1 },
//         pageNo: 1,
//         pageSize: 100,
//         projection: {orderNumber: 1}
//     })

//     // return Promise.all([order, shipmentDetail])
// }))

// 根据身份证号和收件人手机号获取订单列表
router.get('/orders/idCardList', wrap(async req => {
    const query = {
        status: 0,
        recipientCellphoneNumber: req.query.recipientCellphoneNumber
    }
    if (req.query.orderNumber) {
        query.orderNumber = req.query.orderNumber
        query.state = { $ne: 90 }
    } else {
        query.recipientName = req.query.recipientName
        query.state = { $in: [ 10, 20, 30, 40, 50, 60 ] }
        query.$or = [ { recipientIdCardPositiveImg: null }, { recipientIdCardBackImg: null }, {recipientIdNumber: null}, {recipientIdNumber: ''} ]
    }
    return queryList({
        model: Order,
        query,
        sort: { createTime: -1 },
        populate: [
            { path: 'line', select: 'name' }
        ],
        pageNo: 1,
        pageSize: 100,
        projection: { orderNumber: 1, line: 1, recipientName: 1, recipientIdNumber: 1, recipientCellphoneNumber: 1 }
    })
}))

router.post('/orders/uploadIdCardImg', wrap(async req => {
    await Order.update(
        { _id: req.body.orderList, state: { $ne: 90 }, status: 0 },
        { $set: {
            'recipientIdNumber': req.body.recipientIdNumber,
            'recipientIdCardBackImg': req.body.recipientIdCardBackImg,
            'recipientIdCardPositiveImg': req.body.recipientIdCardPositiveImg
        } },
        { multi: true }
    ).exec()

    savePersonInfo()
    saveContract()

    async function saveContract () {
        const orders = await Order.find({ _id: req.body.orderList, state: { $in: [ 10, 20, 30, 40, 50 ] }, status: 0 }).exec()
        const temp = {}
        orders.map(async order => {
            if (order.recipientId && !temp[order.recipientId]) {
                temp[order.recipientId] = 1
                const contract = await Contacts.findById(order.recipientId).exec()
                contract.idNumber = order.recipientIdNumber
                contract.idCardPositiveImg = order.recipientIdCardPositiveImg
                contract.idCardBackImg = order.recipientIdCardBackImg
                contract.save()
            }
        })
    }
    async function savePersonInfo () {
        const order = await Order.findOne({ _id: req.body.orderList, state: { $in: [10, 20, 30, 40, 50] }, status: 0 }).exec()
        personInfoService.updatePersonInfo({
            name: order.recipientName,
            cellphoneNumber: order.recipientCellphoneNumber,
            idNumber: req.body.recipientIdNumber,
            idCardPositiveImg: req.body.recipientIdCardPositiveImg,
            idCardBackImg: req.body.recipientIdCardBackImg
        }).catch(error => console.log(error))
    }
}))

// 订单推送
// http://everfast.ca:3000/api/orders/kdniaoPush
router.post('/orders/kdniaoPush', async (req, res) => {
    try {
        console.log(JSON.stringify(req.body))
        const data = await kdniaoService.parsePush(req.body)
        if (data.RequestType === '101') {
            console.log('kdniaoPush收到一条物流推送(101) ==>', JSON.stringify(data))
            await Promise.all((data.RequestData.Data || []).map(async traceData => {
                if (!traceData.Success) {
                    console.log('订单推送数据报错', traceData)
                    return
                }
                const orders = await orderService.getOrdersByExpress({
                    transhipmentExpressNumber: traceData.LogisticCode,
                    expressCompanyNumber: traceData.ShipperCode
                })
                if (orders.length === 0) {
                    console.log('订单不存在', traceData)
                    return
                }
                for (const order of orders) {
                    // traceData.State 物流状态: 0-无轨迹，1-已揽收，2-在途中 201-到达派件城市，3-签收,4-问题件
                    order.knState = traceData.State
                    if (order.state >= 60 && order.state < 80 && (order.tariffType !== 0 || order.tariffState === 1 || order.tariffState === 3)) {
                        if (traceData.State !== '0') order.state = 70 // 已揽收
                        if (traceData.State === '3') order.state = 80 // 已签收
                    }
                    await order.save()
                    await orderService.updateKnShipmentDetail(order, traceData.Traces)
                    console.log('由推送更新一条运单: ', order._id, order.orderNumber)
                }
            }))
        }
        res.json(kdniaoService.response())
    } catch (e) {
        res.json(kdniaoService.response(e.message))
    }
})

// 测试即时查询接口 /api/orders/testkn
router.get('/orders/testkn/:orderNumber', wrap(async req => {
    return kdniaoService.orderTrack({
        LogisticCode: req.params.orderNumber,
        ShipperCode: 'YTO'
    })
}))

export default router
