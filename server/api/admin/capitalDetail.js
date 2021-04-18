
import { Router } from 'express'
import { CapitalDetail, User } from '../../models'
import * as permissionService from '../../services/permission'
import { wrap, extendByKey } from '../../tools/util'
import { queryList } from '../../tools/dbutil'

const router = Router()

// 获取充值记录
router.get('/capitalDetail/rechange', wrap(async req => {
    await permissionService.validatePermission(req, '05_02')
    const filterableKeys = ['branch']
    const { pageNo, pageSize, mixSearch } = req.query
    const query = extendByKey({ status: 0, recordType: { $in: [30, 40] } }, req.query, filterableKeys)
    if (mixSearch) {
        const user = await User.find({ status: 0, $or: [{ username: new RegExp(mixSearch, 'i') }, { realname: new RegExp(mixSearch, 'i') }] })
        query.account = {$in: user}
    }
    return queryList({
        model: CapitalDetail,
        query,
        sort: { createTime: -1 },
        populate: [
            { path: 'account', select: ['username', 'realname'] },
            { path: 'branch', select: 'name' }
        ],
        pageNo: parseInt(pageNo),
        pageSize: parseInt(pageSize)
    })
}))

export default router
