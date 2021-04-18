
import { Router } from 'express'
import { wrap, extendByKey } from '../../tools/util'

import { PersonInfo } from '../../models'
import * as permissionService from '../../services/permission'
import { queryList } from '../../tools/dbutil'

const router = Router()
const editableKeys = ['name', 'cellphoneNumber', 'idNumber', 'idCardPositiveImg', 'idCardBackImg']

router.get('/personInfo', wrap(async (req, res) => {
    await permissionService.validatePermission(req, '06_02')
    const { pageNo, pageSize, mixSearch } = req.query
    const query = { status: 0 }
    if (mixSearch) {
        query.$or = [
            { name: new RegExp(mixSearch, 'i') },
            { cellphoneNumber: new RegExp(mixSearch, 'i') },
            { idNumber: new RegExp(mixSearch, 'i') }
        ]
    }
    return queryList({
        model: PersonInfo,
        query,
        sort: { name: 1 },
        pageNo: parseInt(pageNo),
        pageSize: parseInt(pageSize)
    })
}))

// 新增
router.post('/personInfo', wrap(async req => {
    await permissionService.validatePermission(req, '06_02')
    const personInfo = await PersonInfo.findOne({name: req.body.name, cellphoneNumber: req.body.cellphoneNumber, status: 0})
    if (personInfo) {
        throw new Error('已存在其它相同姓名和手机号码的信息')
    }
    return new PersonInfo(extendByKey({
        creator: req.user._id
    }, req.body, editableKeys)).save()
}))

// 修改
router.post('/personInfo/:id', wrap(async req => {
    await permissionService.validatePermission(req, '06_02')
    const personInfo = await PersonInfo.findOne({name: req.body.name, cellphoneNumber: req.body.cellphoneNumber, _id: {$ne: req.params.id}, status: 0})
    if (personInfo) {
        throw new Error('已存在其它相同姓名和手机号码的信息')
    }
    return PersonInfo.updateOne({ _id: req.params.id }, { $set: extendByKey({}, req.body, editableKeys) }).exec()
}))

// 删除
router.delete('/personInfo/:id', wrap(async req => {
    await permissionService.validatePermission(req, '06_02')
    await PersonInfo.updateOne({ _id: req.params.id }, { $set: { status: 2 } }).exec()
}))

export default router
