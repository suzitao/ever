
import { Router } from 'express'
import BranchCustomPrice from '../../models/branchCustomPrice'
import { wrap, extendByKey } from '../../tools/util'
import { queryList } from '../../tools/dbutil'

const router = Router()
const editableKeys = ['name', 'line', 'branch', 'unitPrice', 'poundSurcharge', 'startingWeight']

router.get('/branchCustomPrice/currentBranch', wrap(async req => {
    const branchCustomPrices = await BranchCustomPrice.find({ branch: req.session.currentBranchId, status: 0 }).populate([
        { path: 'line', select: ['name', 'line', '_id'] }
    ])
    return branchCustomPrices.filter(f => f.unitPrice).map(item => {
        return {
            name: item.name,
            lineId: item.line._id,
            unitPrice: item.unitPrice,
            poundSurcharge: item.poundSurcharge || 0,
            startingWeight: item.startingWeight || 0,
            _id: item._id
        }
    })
}))

router.get('/branchCustomPrice', wrap(async req => {
    const { pageNo = 1, pageSize = 1000, lineId, branchId } = req.query
    const query = { status: { $in: [0, 1] } }
    if (lineId) query.line = lineId
    if (branchId) query.branch = branchId
    return queryList({
        model: BranchCustomPrice,
        query,
        sort: { index: 1 },
        pageNo: parseInt(pageNo),
        pageSize: parseInt(pageSize)
    })
}))

// 新增
router.post('/branchCustomPrice', wrap(async req => {
    return new BranchCustomPrice(extendByKey({
        creator: req.user._id,
        updator: req.user._id,
        index: req.body.index
    }, req.body, editableKeys)).save()
}))

// 修改
router.post('/branchCustomPrice/:id', wrap(async req => {
    const priceType = await BranchCustomPrice.findById(req.params.id)
    extendByKey(priceType, req.body, editableKeys)
    priceType.updator = req.user._id
    priceType.updateTime = new Date()
    return priceType.save()
}))

// 启用
router.post('/branchCustomPrice/:id/enable', wrap(async req => {
    const priceType = await BranchCustomPrice.findById(req.params.id)
    priceType.status = 0
    priceType.updator = req.user._id
    priceType.updateTime = new Date()
    return priceType.save()
}))

// 禁用
router.post('/branchCustomPrice/:id/disable', wrap(async req => {
    const priceType = await BranchCustomPrice.findById(req.params.id)
    priceType.status = 1
    priceType.updator = req.user._id
    priceType.updateTime = new Date()
    return priceType.save()
}))

// 删除
router.delete('/branchCustomPrice/:id', wrap(async req => {
    const priceType = await BranchCustomPrice.findById(req.params.id)
    priceType.status = 2
    priceType.updator = req.user._id
    priceType.updateTime = new Date()
    return priceType.save()
}))

export default router
