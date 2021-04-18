
import { Router } from 'express'
import images from 'images'
import JSZip from 'jszip'

import * as fileService from '../../services/file'
import * as permissionService from '../../services/permission'

import { Pallet, Order, ShipmentDetail } from '../../models'

import { wrap, extendByKey } from '../../tools/util'
import { queryList } from '../../tools/dbutil'
import generateNumber from '../../tools/generateNumber'
import {
    countWeightGroupByPallet,
    countAmountWithoutTariffGroupByPallet,
    countFreightGroupByPallet,
    countMaterialCostGroupByPallet,
    countPremiumGroupByPallet,
    countTariffGroupByPallet,
    countTariffCNYGroupByPallet,
    countOrderByPallet,
    countNotDispatchOrderByPallet,
    countDispatchingOrderByPallet,
    countDispatchedOrderByPallet
} from '../../tools/orderutil'

const router = Router()

// 获取当前店铺托盘
router.get('/pallet', wrap(async req => {
    await permissionService.validatePermission(req, '04_01')
    const { pageNo, pageSize, mixSearch } = req.query
    const query = { status: 0, branch: req.session.currentBranchId }
    if (mixSearch) {
        query.$or = [
            { palletNumber: new RegExp(mixSearch, 'i') },
            { ladingBillNumber: new RegExp(mixSearch, 'i') }
        ]
    }
    return queryList({
        model: Pallet,
        query,
        sort: { createTime: -1 },
        populate: [
            { path: 'lineList', select: 'lineNumber' },
            { path: 'branch', select: 'name' },
            { path: 'fileList', select: 'originalname' }
        ],
        pageNo: parseInt(pageNo),
        pageSize: parseInt(pageSize)
    })
    // const startTime = new Date().getTime()
    // result.list = await Promise.all(result.list.map(async pallet => {
    //     pallet = pallet.toObject()
    //     pallet['orderActualWeight'] = await countWeightGroupByPallet(pallet._id)
    //     pallet['orderQuantity'] = await countOrderByPallet(pallet._id)
    //     pallet['notDispatchOrder'] = await countNotDispatchOrderByPallet(pallet._id)
    //     pallet['dispatchingOrder'] = await countDispatchingOrderByPallet(pallet._id)
    //     pallet['dispatchedOrder'] = await countDispatchedOrderByPallet(pallet._id)
    //     return pallet
    // }))
    // const finishTime = new Date().getTime()
    // const timeUsed = finishTime - startTime
    // result.countDbTime = `countQuery: pageNo=${pageNo}/pageSize=${pageSize}/startTime=${startTime}/finishTime=${finishTime}/timeUsed=${timeUsed}ms`
    // return result
}))

router.post('/pallet/count', wrap(async req => {
    // const palletId = req.params.id
    return Promise.all(req.body.ids.map(async id => {
        const [orderActualWeight, orderQuantity, notDispatchOrder, dispatchingOrder, dispatchedOrder, orderFreight, orderMaterialCost, orderPremium, orderAmountWithoutTariff, orderTariff] = await Promise.all([
            countWeightGroupByPallet(id),
            countOrderByPallet(id),
            countNotDispatchOrderByPallet(id),
            countDispatchingOrderByPallet(id),
            countDispatchedOrderByPallet(id),
            countFreightGroupByPallet(id),
            countMaterialCostGroupByPallet(id),
            countPremiumGroupByPallet(id),
            countAmountWithoutTariffGroupByPallet(id),
            countTariffGroupByPallet(id)
        ])
        return { id, orderActualWeight, orderQuantity, notDispatchOrder, dispatchingOrder, dispatchedOrder, orderFreight, orderMaterialCost ,orderPremium, orderAmountWithoutTariff, orderTariff }
    }))
    // const [orderActualWeight, orderQuantity, notDispatchOrder, dispatchingOrder, dispatchedOrder] = await Promise.all([
    //     countWeightGroupByPallet(palletId),
    //     countOrderByPallet(palletId),
    //     countNotDispatchOrderByPallet(palletId),
    //     countDispatchingOrderByPallet(palletId),
    //     countDispatchedOrderByPallet(palletId)
    // ])
    // return { orderActualWeight, orderQuantity, notDispatchOrder, dispatchingOrder, dispatchedOrder }
}))

// 托盘详情(校验当前店铺)
router.get('/pallet/:id', wrap(async req => {
    let pallet = await Pallet.findOne({
        _id: req.params.id,
        status: 0,
        branch: req.session.currentBranchId
    }).populate([
        { path: 'lineList', select: 'lineNumber' },
        { path: 'branch', select: 'name' }
    ]).exec()
    if (pallet) {
        pallet = pallet.toObject()
        pallet['orderActualWeight'] = await countWeightGroupByPallet(pallet._id)
        pallet['orderAmountWithoutTariff'] = await countAmountWithoutTariffGroupByPallet(pallet._id)
        pallet['orderFreight'] = await countFreightGroupByPallet(pallet._id)
        pallet['orderMaterialCost'] = await countMaterialCostGroupByPallet(pallet._id)
        pallet['orderPremium'] = await countPremiumGroupByPallet(pallet._id)
        pallet['orderTariff'] = await countTariffGroupByPallet(pallet._id)
        pallet['orderTariffCNY'] = await countTariffCNYGroupByPallet(pallet._id)
        return pallet
    }
}))

// 新增托盘
router.post('/pallet', wrap(async req => {
    await permissionService.validatePermission(req, '04_02')
    const editableKeys = ['lineList', 'weight']
    const palletNumber = await generateNumber(9, Pallet, 'palletNumber', false)
    return new Pallet(extendByKey({
        palletNumber,
        creator: req.user._id,
        branch: req.session.currentBranchId
    }, req.body, editableKeys)).save()
}))

// 修改托盘
router.post('/pallet/:id', wrap(async req => {
    await permissionService.validatePermission(req, '04_03')
    const editableKeys = ['weight', 'airFreightPrice', 'ladingBillNumber', 'remark', 'clearanceRemark', 'fileList']
    return Pallet.updateOne({ _id: req.params.id }, { $set: extendByKey({}, req.body, editableKeys) }).exec()
}))

// 删除托盘
router.delete('/pallet/:id', wrap(async req => {
    await permissionService.validatePermission(req, '04_04')
    const { id } = req.params
    const pallet = await Pallet.findOne({ _id: id, state: 10 }, { state: 1 })
    // console.log(pallet.state)
    if (pallet.state !== 10) {
        throw new Error('托盘不能删除,状态不为10')
    }
    await Order.update(
        { pallet: id, status: 0 },
        { $set: { 'pallet': null } },
        { multi: true }
    ).exec()
    await Pallet.updateOne({ _id: id, state: 10 }, { $set: { status: 2 } }).exec()
}))

// 封盘
router.post('/pallet/:id/close', wrap(async req => {
    await permissionService.validatePermission(req, '04_05')
    const { id } = req.params
    await Pallet.updateOne({ _id: id, state: 10 }, { $set: { state: 20 } }).exec()
}))

// 反封盘
router.post('/pallet/:id/open', wrap(async req => {
    await permissionService.validatePermission(req, '04_05')
    const { id } = req.params
    await Pallet.updateOne({ _id: id, state: 20 }, { $set: { state: 10 } }).exec()
}))

// 托盘发出
router.post('/pallet/:id/transport', wrap(async req => {
    await permissionService.validatePermission(req, '04_06')
    const pallet = await Pallet.findOne({ _id: req.params.id }, { state: 1 })
    if (pallet.state !== 20) {
        throw new Error('托盘不能发出,状态不为20')
    }
    await Order.update(
        { pallet: req.params.id, status: 0 },
        { $set: { 'state': 50 } },
        { multi: true }
    ).exec()
    await Pallet.updateOne({ _id: req.params.id, state: 20 }, { $set: { state: 30 } }).exec()
    const orders = await Order.find({ pallet: req.params.id, status: 0 })
    for (const order of orders) {
        try {
            await new ShipmentDetail({
                order: order._id,
                information: '运单' + order.orderNumber + '已出库送往机场，等待航班起飞[Canada]',
                creator: req.user._id
            }).save()
        } catch (e) {
            console.log(e)
        }
    }
}))

// 托盘起飞
router.post('/pallet/:id/takeoff', wrap(async req => {
    await permissionService.validatePermission(req, '04_06')
    const pallet = await Pallet.findOne({ _id: req.params.id }, { state: 1 })
    if (pallet.state !== 30) {
        throw new Error('托盘不能起飞，状态不为30')
    }
    await Pallet.updateOne({ _id: req.params.id, state: 30 }, { $set: { state: 35 } }).exec()
    const orders = await Order.find({ pallet: req.params.id, status: 0 })
    for (const order of orders) {
        try {
            await new ShipmentDetail({
                order: order._id,
                information: '运单' + order.orderNumber + '航班已起飞前往中国[Canada]',
                creator: req.user._id
            }).save()
        } catch (e) {
            console.log(e)
        }
    }
}))

// 托盘到达
router.post('/pallet/:id/receive', wrap(async req => {
    await permissionService.validatePermission(req, '04_07')
    const pallet = await Pallet.findOne({ _id: req.params.id }, { state: 1 })
    if (pallet.state !== 35) {
        throw new Error('托盘不能到达,状态不为35')
    }
    await Order.update(
        { pallet: req.params.id, status: 0 },
        { $set: { 'state': 50 } },
        { multi: true }
    ).exec()
    await Pallet.updateOne({ _id: req.params.id, state: 35 }, { $set: { state: 40 } }).exec()
    const order = await Order.find({ pallet: req.params.id, status: 0 })
    if (order) {
        if (order._id) {
            try {
                await new ShipmentDetail({
                    order: order._id,
                    information: '运单' + order.orderNumber + '已到达中国仓库，等待清关[中国]',
                    creator: req.user._id
                }).save()
            } catch (error) {
                console.log(error)
            }
        } else {
            for (var index in order) {
                try {
                    await new ShipmentDetail({
                        order: order[index]._id,
                        information: '运单' + order[index].orderNumber + '已到达中国仓库，等待清关[中国]',
                        creator: req.user._id
                    }).save()
                } catch (error) {
                    console.log(error)
                }
            }
        }
    }
}))

// 托盘开始清关
router.post('/pallet/:id/clear', wrap(async req => {
    await permissionService.validatePermission(req, '04_08')
    const pallet = await Pallet.findOne({ _id: req.params.id, state: 40 }, { state: 1 })
    if (pallet.state !== 40) {
        throw new Error('托盘不能发出,状态不为20')
    }
    await Order.update(
        { pallet: req.params.id, status: 0 },
        { $set: { 'state': 60 } },
        { multi: true }
    ).exec()
    await Pallet.updateOne({ _id: req.params.id, state: 40 }, { $set: { state: 50 } }).exec()
    const order = await Order.find({ pallet: req.params.id, status: 0 })
    if (order) {
        if (order._id) {
            try {
                await new ShipmentDetail({
                    order: order._id,
                    information: '运单' + order.orderNumber + '已进入清关程序[中国]',
                    creator: req.user._id
                }).save()
            } catch (error) {
                console.log(error)
            }
        } else {
            for (var index in order) {
                try {
                    await new ShipmentDetail({
                        order: order[index]._id,
                        information: '运单' + order[index].orderNumber + '已进入清关程序[中国]',
                        creator: req.user._id
                    }).save()
                } catch (error) {
                    console.log(error)
                }
            }
        }
    }
}))

// 下载托盘全部身份证
router.get('/pallet/:id/DlIdCard', async (req, res) => {
    try {
        let orders = await Order.find({ pallet: req.params.id, status: 0 })
        const fileList = []
        orders = orders.filter(order => order.recipientIdCardPositiveImg && order.recipientIdCardBackImg)
        orders.forEach(order => {
            const fileName = order.recipientIdNumber ? `${order.orderNumber}${order.recipientName}${order.recipientIdNumber}` : `${order.orderNumber}${order.recipientName}`

            fileList.push({
                id: order.recipientIdCardPositiveImg,
                fileName: `${fileName}(1)`
            })

            fileList.push({
                id: order.recipientIdCardBackImg,
                fileName: `${fileName}(2)`
            })
        })
        fileService.batchDl(res, fileList)
    } catch (e) {
        res.status(404).send(e.message)
    }
})

// 下载托盘全部合成身份证
router.get('/pallet/:id/DlMergeIdCard', async (req, res) => {
    try {
        let orders = await Order.find({ pallet: req.params.id, status: 0 })
        const zip = new JSZip()
        orders = orders.filter(order => order.recipientIdCardPositiveImg && order.recipientIdCardBackImg)
        // orders = await Promise.all(orders.map(async order => {
        //     const image1 = await fileService.getFileBufferByFileId(order.recipientIdCardPositiveImg)
        //     const image2 = await fileService.getFileBufferByFileId(order.recipientIdCardBackImg)
        //     const fileName = order.recipientIdNumber ? `${order.orderNumber}${order.recipientName}${order.recipientIdNumber}` : `${order.orderNumber}${order.recipientName}`
        //     return { image1, image2, fileName }
        // }))
        // for (const order of orders) {
        //     const newImage = images(856, 1080)
        //     newImage.draw(images(order.image1).size(856, 540), 0, 0)
        //     newImage.draw(images(order.image2).size(856, 540), 0, 540)
        //     zip.file(order.fileName + '.jpg', newImage.encode('jpg', { quality: 50 }))
        //     images.gc()
        // }
        for (const order of orders) {
            let fileName
            if (req.query.photoName) {
                fileName = req.query.photoName.replace(/{orderNumber}/g, order.orderNumber).replace(/{transhipmentExpressNumber}/g, order.transhipmentExpressNumber).replace(/{recipientIdNumber}/g, order.recipientIdNumber).replace(/{recipientName}/g, order.recipientName)
            } else {
                fileName = order.recipientIdNumber ? `${order.orderNumber}${order.recipientName}${order.recipientIdNumber}` : `${order.orderNumber}${order.recipientName}`
            }

            const newImage = images(856, 1080)
            newImage.draw(images(await fileService.getFileBufferByFileId(order.recipientIdCardPositiveImg)).size(856, 540), 0, 0)
            newImage.draw(images(await fileService.getFileBufferByFileId(order.recipientIdCardBackImg)).size(856, 540), 0, 540)

            zip.file(fileName + '.jpg', newImage.encode('jpg', { quality: 50 }))
            images.gc()
        }
        const stream = zip.generateNodeStream({ streamFiles: true })
        stream.on('error', (err) => {
            console.log('batchDl stream error', err)
        })
        res.attachment('batchDl.zip')
        stream.pipe(res)
    } catch (e) {
        res.status(404).send(e.message)
    }
})

export default router
