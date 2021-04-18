import { Router } from 'express'
import { wrap, extendByKey } from '../../tools/util'
import { UserBranchCustomPrice } from '../../models'
import { queryList, getObjectId} from '../../tools/dbutil'

const router = Router()
const editableKeys = ['branchCustomPrice', 'unitPrice', 'poundSurcharge', 'startingWeight']

router.get('/userBranchCustomPrice', wrap(async req => {
    const { pageNo = 1, pageSize = 1000, userId } = req.query
    const query = { status: { $in: [0, 1] } }
    if (userId) query.user = userId
    return queryList({
        model: UserBranchCustomPrice,
        query,
        pageNo: parseInt(pageNo),
        pageSize: parseInt(pageSize)
    })
}))

// 修改
router.post('/userBranchCustomPrice/:userId', wrap(async (req) => {
    const userId = req.params.userId
    const existingPrices = req.body.filter(item => item._id)
    const idsToDelete = existingPrices.map(item => getObjectId(item._id))
    await UserBranchCustomPrice.deleteMany({ _id: {$in: idsToDelete} }).exec()
    return Promise.all(req.body.map(async item => {
        const userPriceType = new UserBranchCustomPrice({ user: userId, creator: req.user._id, updator: req.user._id })
        extendByKey(userPriceType, item, editableKeys)
        return userPriceType.save()
    }))
}))

// 删除
router.delete('/userBranchCustomPrice/:userId', wrap(async (req) => {
    const userId = req.params.userId
    await UserBranchCustomPrice.deleteMany({ user: userId })
}))

export default router
