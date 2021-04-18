/**
 * Created by suzitao on 2017/7/4.
 */

import { Router } from 'express'
import { wrap } from '../../tools/util'
import { queryList } from '../../tools/dbutil'

import CapitalDetail from '../../models/capitalDetail'

const router = Router()

router.get('/capitalDetail', wrap(async req => {
    const { pageNo, pageSize } = req.query
    return queryList({
        model: CapitalDetail,
        query: {
            status: 0,
            account: req.user._id
        },
        sort: { createTime: -1 },
        populate: [
            { path: 'branch', select: 'name' },
            { path: 'order', select: 'orderNumber' }
        ],
        pageNo: parseInt(pageNo),
        pageSize: parseInt(pageSize)
    })
}))

export default router
