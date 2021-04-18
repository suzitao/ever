/**
 * Created by suzitao on 2017/7/4.
 */

import { Router } from 'express'
import { wrap, extendByKey } from '../../tools/util'
import { queryList } from '../../tools/dbutil'

import CommonGoods from '../../models/commonGoods'

const router = Router()
const editableKeys = ['name', 'brand', 'valueDeclared', 'measurementUnit']

router.get('/commonGoods', wrap(async req => {
    const { pageNo, pageSize, mixSearch } = req.query
    const query = {creator: req.user._id, status: 0}
    if (mixSearch) {
        query.$or = [
            { name: new RegExp(mixSearch, 'i') },
            { brand: new RegExp(mixSearch, 'i') }
        ]
    }
    return queryList({
        model: CommonGoods,
        query,
        sort: { createTime: -1 },
        pageNo: parseInt(pageNo),
        pageSize: parseInt(pageSize)
    })
}))

// 新增
router.post('/commonGoods', wrap(async req => {
    return new CommonGoods(extendByKey({
        creator: req.user._id
    }, req.body, editableKeys)).save()
}))

// 修改
router.post('/commonGoods/:id', wrap(async req => {
    return CommonGoods.updateOne({
        _id: req.params.id,
        creator: req.user._id
    }, { $set: extendByKey({}, req.body, editableKeys) }).exec()
}))

// 删除
router.delete('/commonGoods/:id', wrap(async req => {
    await CommonGoods.updateOne({
        _id: req.params.id,
        creator: req.user._id
    }, { $set: { status: 2 } }).exec()
}))

export default router
