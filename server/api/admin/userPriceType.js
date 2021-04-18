
import { Router } from 'express'
import { wrap, extendByKey } from '../../tools/util'
import { UserPriceType } from '../../models'
import { queryList } from '../../tools/dbutil'

const router = Router()
const editableKeys = ['priceType', 'unitPrice', 'poundSurcharge', 'startingWeight']

router.get('/userPriceType', wrap(async req => {
    const { pageNo = 1, pageSize = 1000, userId } = req.query
    const query = { status: { $in: [0, 1] }, branch: req.session.currentBranchId }
    if (userId) query.user = userId
    return queryList({
        model: UserPriceType,
        query,
        pageNo: parseInt(pageNo),
        pageSize: parseInt(pageSize)
    })
}))

// 修改
router.post('/userPriceType/:userId', wrap(async (req) => {
    const userId = req.params.userId
    const branch = req.session.currentBranchId
    await UserPriceType.deleteMany({ user: userId, branch })
    return Promise.all(req.body.map(async item => {
        const userPriceType = new UserPriceType({ user: userId, creator: req.user._id, updator: req.user._id, branch })
        extendByKey(userPriceType, item, editableKeys)
        return userPriceType.save()
    }))
}))

export default router
