
import { Router } from 'express'
import * as permissionService from '../../services/permission'
import { wrap, extendByKey } from '../../tools/util'
import { queryList } from '../../tools/dbutil'
import Line from '../../models/line'
import Pricetype from '../../models/priceType'

const router = Router()
const editableKeys = ['lineNumber', 'name', 'description', 'tariffType', 'isSupportValueDeclared', 'valueDeclaredRate', 'defaultCoverage', 'maxCoverage']

// 添加价格分类
router.post('/line/:id/priceType', wrap(async (req) => {
    return new Pricetype(extendByKey({
        creator: req.user._id,
        line: req.params.id
    }, req.body, ['name'])).save()
}))

// 删除价格分类
router.delete('/line/priceType/:id', wrap(async (req) => {
    return Pricetype.updateOne({ _id: req.params.id }, { $set: { status: 2 } }).exec()
}))

router.get('/line', wrap(async (req, res) => {
    const { pageNo, pageSize, mixSearch } = req.query
    const query = { status: { $in: [0, 1] } }
    if (mixSearch) {
        query.$or = [
            { lineNumber: new RegExp(mixSearch, 'i') },
            { name: new RegExp(mixSearch, 'i') }
        ]
    }
    return queryList({
        model: Line,
        query,
        sort: { createTime: -1 },
        pageNo: parseInt(pageNo),
        pageSize: parseInt(pageSize)
    })
}))

// 新增线路
router.post('/line', wrap(async req => {
    await permissionService.validatePermission(req, '08_04')
    return new Line(extendByKey({
        creator: req.user._id
    }, req.body, editableKeys)).save()
}))

// 修改线路
router.post('/line/:id', wrap(async req => {
    await permissionService.validatePermission(req, '08_04')
    return Line.updateOne({ _id: req.params.id }, { $set: extendByKey({}, req.body, editableKeys) }).exec()
}))

// 禁用
router.post('/line/:id/setDisable', wrap(async req => {
    await permissionService.validatePermission(req, '08_04')
    const line = await Line.findById(req.params.id)
    line.status = 1
    await line.save()
}))

// 启用
router.post('/line/:id/setEnable', wrap(async req => {
    await permissionService.validatePermission(req, '08_04')
    const line = await Line.findById(req.params.id)
    line.status = 0
    await line.save()
}))

// 删除线路
router.delete('/line/:id', wrap(async req => {
    await permissionService.validatePermission(req, '08_04')
    const line = await Line.findById(req.params.id)
    line.status = 2
    await line.save()
}))

export default router
