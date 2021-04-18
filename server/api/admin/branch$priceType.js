
import { Router } from 'express'
import { wrap, extendByKey } from '../../tools/util'
import { PriceType, Branch$PriceType } from '../../models'
import { queryList } from '../../tools/dbutil'

const router = Router()
const editableKeys = ['priceType', 'unitPrice', 'poundSurcharge', 'startingWeight']

router.get('/branchpriceType/currentBranch', wrap(async (req) => {
    const branch$PriceTypes = await Branch$PriceType.find({ branch: req.session.currentBranchId, priceType: { $in: (await PriceType.find({ status: 0 })) }, status: 0 }).populate([
        { path: 'priceType', select: ['name', 'line'] }
    ])
    return branch$PriceTypes.filter(f => f.unitPrice).map(item => {
        return {
            name: item.priceType.name,
            lineId: item.priceType.line,
            unitPrice: item.unitPrice,
            poundSurcharge: item.poundSurcharge || 0,
            startingWeight: item.startingWeight || 0,
            _id: item._id
        }
    })
}))

router.get('/branchpriceType/:branchId', wrap(async (req) => {
    return Branch$PriceType.find({ status: { $in: [0, 1] }, branch: req.params.branchId })
}))

router.get('/branchpriceType', wrap(async req => {
    const { pageNo, pageSize, branchId } = req.query
    const query = { status: { $in: [0, 1] } }
    if (branchId) query.branch = branchId
    return queryList({
        model: Branch$PriceType,
        query,
        pageNo: parseInt(pageNo),
        pageSize: parseInt(pageSize)
    })
}))

// 修改
router.post('/branchpriceType/:branchId', wrap(async (req) => {
    const branchId = req.params.branchId
    await Branch$PriceType.deleteMany({ branch: branchId })
    return Promise.all(req.body.map(async item => {
        const branch$priceType = new Branch$PriceType({ branch: branchId, creator: req.user._id, updator: req.user._id })
        extendByKey(branch$priceType, item, editableKeys)
        return branch$priceType.save()
    }))
}))

export default router
