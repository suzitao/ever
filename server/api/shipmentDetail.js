
import { Router } from 'express'
import { wrap } from '../tools/util'
import { queryList } from '../tools/dbutil'

import ShipmentDetail from '../models/shipmentDetail'
import Order from '../models/order'

import * as orderService from '../services/order'

const router = Router()

// 通过运单号或orderId查询快递记录,优先取orderId
router.get('/shipmentDetail', wrap(async req => {
    let order
    if (req.query.orderId) {
        order = await Order.findOne({ _id: req.query.orderId, status: 0 }, { _id: 1, orderNumber: 1, state: 1, knState: 1, transhipmentExpressNumber: 1, transhipmentExpressCompany: 1 }).populate([
            { path: 'transhipmentExpressCompany', select: ['expressCompanyNumber', 'name'] }
        ]).exec()
    } else if (req.query.orderNumber) {
        order = await Order.findOne({ orderNumber: req.query.orderNumber, status: 0 }, { _id: 1, orderNumber: 1, state: 1, knState: 1, transhipmentExpressNumber: 1, transhipmentExpressCompany: 1 }).populate([
            { path: 'transhipmentExpressCompany', select: ['expressCompanyNumber', 'name'] }
        ]).exec()
        if (!order) {
            order = await Order.findOne({ transhipmentExpressNumber: req.query.orderNumber, status: 0 }, { _id: 1, orderNumber: 1, state: 1, knState: 1, transhipmentExpressNumber: 1, transhipmentExpressCompany: 1 }).populate([
                { path: 'transhipmentExpressCompany', select: ['expressCompanyNumber', 'name'] }
            ]).exec()
        }
    } else {
        throw new Error('请传入运单id或编码')
    }
    if (!order) {
        return '找不到对应运单'
    }
    // await orderService._orderTrack(order)
    let { list, total } = await queryList({
        model: ShipmentDetail,
        query: {
            order: order._id,
            status: 0
        },
        sort: { createTime: -1 },
        pageNo: 1,
        pageSize: 10000
    })
    list = orderService.formatShipmentDetail(list)
    return {
        list,
        total,
        state: order.state,
        orderNumber: order.orderNumber,
        transhipmentExpressNumber: order.transhipmentExpressNumber,
        transhipmentExpressCompany: order.transhipmentExpressCompany
    }
}))

export default router
