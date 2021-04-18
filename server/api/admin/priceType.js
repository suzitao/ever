
import { Router } from 'express'
import PriceType from '../../models/priceType'
import { wrap, extendByKey } from '../../tools/util'
import { queryList } from '../../tools/dbutil'

const router = Router()
const editableKeys = ['name', 'line']

router.get('/priceType/getByBranch/:branchId', wrap(async (req, res) => {
    return PriceType.find({ status: 0 }).sort({ index: 1 })
}))

router.get('/priceType/:lineId', wrap(async (req, res) => {
    return PriceType.find({ status: { $in: [0, 1] }, line: req.params.lineId }).sort({ index: 1 })
}))

router.get('/priceType', wrap(async req => {
    const { pageNo, pageSize, lineId } = req.query
    const query = { status: { $in: [0, 1] } }
    if (lineId) query.line = lineId
    return queryList({
        model: PriceType,
        query,
        sort: { index: 1 },
        pageNo: parseInt(pageNo),
        pageSize: parseInt(pageSize)
    })
}))

// 新增
router.post('/priceType', wrap(async req => {
    return new PriceType(extendByKey({
        creator: req.user._id,
        updator: req.user._id,
        index: req.body.index
    }, req.body, editableKeys)).save()
}))

// 修改
router.post('/priceType/:id', wrap(async req => {
    const priceType = await PriceType.findById(req.params.id)
    extendByKey(priceType, req.body, editableKeys)
    priceType.updator = req.user._id
    priceType.updateTime = new Date()
    return priceType.save()
}))

// 启用
router.post('/priceType/:id/enable', wrap(async req => {
    const priceType = await PriceType.findById(req.params.id)
    priceType.status = 0
    priceType.updator = req.user._id
    priceType.updateTime = new Date()
    return priceType.save()
}))

// 禁用
router.post('/priceType/:id/disable', wrap(async req => {
    const priceType = await PriceType.findById(req.params.id)
    priceType.status = 1
    priceType.updator = req.user._id
    priceType.updateTime = new Date()
    return priceType.save()
}))

// 删除
router.delete('/priceType/:id', wrap(async req => {
    const priceType = await PriceType.findById(req.params.id)
    priceType.status = 2
    priceType.updator = req.user._id
    priceType.updateTime = new Date()
    return priceType.save()
}))

export default router
