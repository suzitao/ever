
import { Router } from 'express'
import { ExchangeRate } from '../../models'
import * as permissionService from '../../services/permission'
import { wrap, extendByKey } from '../../tools/util'
import { queryList } from '../../tools/dbutil'

const router = Router()
const editableKeys = ['value']

router.get('/exchangeRate', wrap(async req => {
    await permissionService.validatePermission(req, '08_06')
    const { pageNo, pageSize } = req.query
    const query = { status: 0 }
    return queryList({
        model: ExchangeRate,
        query,
        sort: { createTime: -1 },
        pageNo: parseInt(pageNo),
        pageSize: parseInt(pageSize)
    })
}))

// 新增
router.post('/exchangeRate', wrap(async req => {
    await permissionService.validatePermission(req, '08_06')
    return new ExchangeRate(extendByKey({
        creator: req.user._id
    }, req.body, editableKeys)).save()
}))

// 修改
router.post('/exchangeRate/:id', wrap(async req => {
    await permissionService.validatePermission(req, '08_06')
    return ExchangeRate.updateOne({ _id: req.params.id }, { $set: extendByKey({}, req.body, editableKeys) }).exec()
}))

// 删除
router.delete('/exchangeRate/:id', wrap(async req => {
    await permissionService.validatePermission(req, '08_06')
    await ExchangeRate.updateOne({ _id: req.params.id }, { $set: { status: 2 } }).exec()
}))

export default router
