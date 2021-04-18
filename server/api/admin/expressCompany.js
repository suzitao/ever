
import { Router } from 'express'
import * as permissionService from '../../services/permission'
import { wrap, extendByKey } from '../../tools/util'
import { queryList } from '../../tools/dbutil'
import ExpressCompany from '../../models/expressCompany'

const router = Router()
const editableKeys = ['expressCompanyNumber', 'name']

router.get('/expressCompany', wrap(async req => {
    await permissionService.validatePermission(req, '08_05')
    const { pageNo, pageSize, mixSearch } = req.query
    const query = { status: 0 }
    if (mixSearch) {
        query.$or = [
            { expressCompanyNumber: new RegExp(mixSearch, 'i') },
            { name: new RegExp(mixSearch, 'i') }
        ]
    }
    return queryList({
        model: ExpressCompany,
        query,
        sort: { expressCompanyNumber: 1 },
        pageNo: parseInt(pageNo),
        pageSize: parseInt(pageSize)
    })
}))

// 新增
router.post('/expressCompany', wrap(async req => {
    await permissionService.validatePermission(req, '08_05')
    return new ExpressCompany(extendByKey({
        creator: req.user._id
    }, req.body, editableKeys)).save()
}))

// 修改
router.post('/expressCompany/:id', wrap(async req => {
    await permissionService.validatePermission(req, '08_05')
    return ExpressCompany.updateOne({ _id: req.params.id }, { $set: extendByKey({}, req.body, editableKeys) }).exec()
}))

// 删除
router.delete('/expressCompany/:id', wrap(async req => {
    await permissionService.validatePermission(req, '08_05')
    await ExpressCompany.updateOne({ _id: req.params.id }, { $set: { status: 2 } }).exec()
}))

export default router
