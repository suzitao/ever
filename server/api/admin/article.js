
import { Router } from 'express'
import { Article } from '../../models'
import * as permissionService from '../../services/permission'
import { wrap, extendByKey } from '../../tools/util'
import { queryList } from '../../tools/dbutil'

const router = Router()
const editableKeys = ['title', 'html', 'type', 'headImg']

router.get('/article', wrap(async req => {
    await permissionService.validatePermission(req, '08_01')
    const { pageNo, pageSize, mixSearch } = req.query
    const query = { status: { $in: [0, 1] } }
    if (mixSearch) {
        query.$or = [
            { articleNumber: new RegExp(mixSearch, 'i') },
            { title: new RegExp(mixSearch, 'i') }
        ]
    }
    return queryList({
        model: Article,
        query,
        sort: { articleNumber: 1 },
        pageNo: parseInt(pageNo),
        pageSize: parseInt(pageSize)
    })
}))

router.get('/article/:id', wrap(async req => {
    await permissionService.validatePermission(req, '08_01')
    return Article.findOne({
        _id: req.params.id,
        status: { $in: [0, 1] }
    }).exec()
}))

// 新增
router.post('/article', wrap(async req => {
    await permissionService.validatePermission(req, '08_01')
    return new Article(extendByKey({
        creator: req.user._id,
        articleNumber: String(Date.now())
    }, req.body, editableKeys)).save()
}))

// 修改
router.post('/article/:id', wrap(async req => {
    await permissionService.validatePermission(req, '08_01')
    return Article.updateOne({ _id: req.params.id }, { $set: extendByKey({}, req.body, editableKeys) }).exec()
}))

// 禁用
router.post('/article/:id/setDisable', wrap(async req => {
    await permissionService.validatePermission(req, '08_01')
    await Article.updateOne({ _id: req.params.id }, { $set: { status: 1 } }).exec()
}))

// 启用
router.post('/article/:id/setEnable', wrap(async req => {
    await permissionService.validatePermission(req, '08_01')
    await Article.updateOne({ _id: req.params.id }, { $set: { status: 0 } }).exec()
}))

// 删除
router.delete('/article/:id', wrap(async req => {
    await permissionService.validatePermission(req, '08_01')
    await Article.updateOne({ _id: req.params.id }, { $set: { status: 2 } }).exec()
}))

export default router
