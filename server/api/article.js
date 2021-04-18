
import { Router } from 'express'
import { wrap } from '../tools/util'
import { queryList } from '../tools/dbutil'
import Article from '../models/article'

const router = Router()

router.get('/article/news', wrap(async req => {
    const { pageNo, pageSize } = req.query
    const query = { status: 0, type: { $in: [0, 1] } }
    return queryList({
        model: Article,
        query,
        sort: { articleNumber: 1 },
        pageNo: parseInt(pageNo),
        pageSize: parseInt(pageSize)
    })
}))

router.get('/article/product', wrap(async req => {
    const { pageNo, pageSize } = req.query
    const query = { status: 0, type: { $in: [3] } }
    return queryList({
        model: Article,
        query,
        sort: { articleNumber: 1 },
        pageNo: parseInt(pageNo),
        pageSize: parseInt(pageSize)
    })
}))

router.get('/article/:id', wrap(async req => {
    return Article.findOne({
        _id: req.params.id,
        status: 0
    }).exec()
}))

export default router
