
import { Router } from 'express'
import { wrap } from '../tools/util'
import { queryList } from '../tools/dbutil'

import Line from '../models/line'

const router = Router()

// 获取所有线路
router.get('/lines', wrap(async req => {
    const { pageNo = 1, pageSize = 100 } = req.query
    return queryList({
        model: Line,
        query: { status: 0 },
        sort: { createTime: -1 },
        pageNo: parseInt(pageNo),
        pageSize: parseInt(pageSize)
    })
}))

export default router
