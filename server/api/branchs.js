
import { Router } from 'express'
import { wrap } from '../tools/util'
import { queryList } from '../tools/dbutil'

import Branch from '../models/branch'

const router = Router()

// 获取所有店铺
router.get('/branchs', wrap(async req => {
    const { pageNo = 1, pageSize = 100 } = req.query
    const branchs = await queryList({
        model: Branch,
        query: { status: 0 },
        sort: { createTime: -1 },
        populate: [
            { path: 'lineList' }
        ],
        pageNo: parseInt(pageNo),
        pageSize: parseInt(pageSize)
    })
    branchs.list.forEach(branch => { branch.lineList = branch.lineList.filter(line => line.status === 0) })
    return branchs
}))

export default router
