
import { Router } from 'express'

import { wrap } from '../../tools/util'
import * as smsService from '../../services/sms'
import * as alimailService from '../../services/alimail'
import * as stoService from '../../services/sto'
import { Order, Pallet, ShipmentDetail, Area } from '../../models'
import PermissionItem from '../../models/permissionItem'

const router = Router()

// 短信测试
router.get('/test/sendMessage/:number', wrap(async req => {
    const number = req.params.number.split(',')
    return smsService.sendIdCardSMS(number, '053530275')
}
))

// 数据处理
router.get('/test/queryShipmentDetail', wrap(async req => {
    if (!req.query.pallet || !req.query.info) throw new Error('pallet or info can not be null')
    console.log('req.query.info')
    const pallets = await Pallet.find({palletNumber: { $in: req.query.pallet.split(',') }})
    const orders = await Order.find({ pallet: {$in: pallets} })
    return ShipmentDetail.find({ order: { $in: orders }, information: new RegExp(req.query.info) })
}))

// 数据处理
router.get('/test/deleteShipmentDetail', wrap(async req => {
    if (!req.query.pallet || !req.query.info) throw new Error('pallet or info can not be null')
    console.log('req.query.info')
    const pallets = await Pallet.find({palletNumber: { $in: req.query.pallet.split(',') }})
    const orders = await Order.find({ pallet: {$in: pallets} })
    return ShipmentDetail.deleteMany({ order: { $in: orders }, information: new RegExp(req.query.info) })
}))

router.get('/test/formatOrderAddress/:state', wrap(async req => {
    // 053620351
    const rsl1 = []
    const rsl2 = []
    const rsl3 = []
    const orders = await Order.find({ state: Number(req.params.state) })
    console.log('读取完毕')
    let _flag = false
    let count = 0
    for (const order of orders) {
        const addleng = order.recipientAddress.length
        order.recipientAddress[addleng - 1] = order.recipientAddress[addleng - 1].trim()
        let flag = true
        while (flag) {
            flag = false
            for (let i = 0; i < (addleng - 1); i++) {
                if (order.recipientAddress[addleng - 1].indexOf(order.recipientAddress[i]) === 0) {
                    order.recipientAddress[addleng - 1] = order.recipientAddress[addleng - 1].slice(order.recipientAddress[i].length).trim()
                    flag = true
                    _flag = true
                }
            }
        }
        while (!order.recipientAddress[order.recipientAddress.length - 1]) {
            order.recipientAddress.pop()
            _flag = true
        }

        const addleng2 = order.senderAddress.length
        order.senderAddress[addleng2 - 1] = order.senderAddress[addleng2 - 1].trim()
        let flag2 = true
        while (flag2) {
            flag2 = false
            for (let i = 0; i < addleng2 - 1; i++) {
                if (order.senderAddress[addleng2 - 1].indexOf(order.senderAddress[i]) === 0) {
                    order.senderAddress[addleng2 - 1] = order.senderAddress[addleng2 - 1].slice(order.senderAddress[i].length).trim()
                    flag2 = true
                    _flag = true
                }
            }
        }

        while (!order.senderAddress[order.senderAddress.length - 1]) {
            order.senderAddress.pop()
            _flag = true
        }

        if (order.recipientAddress < 4) rsl1.push(order.orderNumber)
        else if (order.senderAddress < 3) rsl2.push(order.orderNumber)
        else if (_flag) {
            console.log(order.senderAddress)
            console.log(order.recipientAddress)
            await Order.findByIdAndUpdate(order._id, { recipientAddress: order.recipientAddress, senderAddress: order.senderAddress })
            rsl3.push(order.orderNumber)
            console.log(++count)
        } else {}
    }
    console.log('处理完毕')
    return {rsl1, rsl2, rsl3}
}))

// 邮件测试
router.get('/test/mail', wrap(async req => {
    const params = {
        AccountName: 'account@mail.everfast.ca',
        // AccountName: '',
        ToAddress: '3265854@qq.com',
        // ToAddress: '1@test.com',
        Subject: 'testmail',
        TextBody: 'testmail'
    }
    return alimailService.test(params)
}))

// 插入权限项
router.get('/test/insertPerItem/:number/:name', wrap(async req => {
    const permissionItemNumber = req.params.number
    const name = req.params.name
    return new PermissionItem({permissionItemNumber, name}).save()
}))

router.get('/test/orderTrack/:billCode', wrap(async req => {
    return stoService.orderTrack(req.params.billCode)
}))

export default router
