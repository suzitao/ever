
import { Router } from 'express'
import { wrap } from '../../tools/util'
import { getAccountAmount } from '../../tools/userutil'

const router = Router()

// 账户余额查询
router.get('/user/accountAmount', wrap(async req => {
    return getAccountAmount(req.user._id)
}))

export default router
