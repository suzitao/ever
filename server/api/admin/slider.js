
import { Router } from 'express'
import { Slider } from '../../models'
import * as permissionService from '../../services/permission'
import { wrap, extendByKey } from '../../tools/util'
import { queryList } from '../../tools/dbutil'

const router = Router()
const editableKeys = ['name', 'img']

router.get('/slider', wrap(async (req, res) => {
    await permissionService.validatePermission(req, '08_02')
    const { pageNo, pageSize, mixSearch } = req.query
    const query = { status: { $in: [0, 1] } }
    if (mixSearch) {
        query.$or = [
            { sliderNumber: new RegExp(mixSearch, 'i') },
            { name: new RegExp(mixSearch, 'i') }
        ]
    }
    return queryList({
        model: Slider,
        query,
        sort: { sliderNumber: 1 },
        pageNo: parseInt(pageNo),
        pageSize: parseInt(pageSize)
    })
}))

// 新增
router.post('/slider', wrap(async req => {
    await permissionService.validatePermission(req, '08_02')
    return new Slider(extendByKey({
        creator: req.user._id,
        sliderNumber: String(Date.now())
    }, req.body, editableKeys)).save()
}))

// 修改
router.post('/slider/:id', wrap(async req => {
    await permissionService.validatePermission(req, '08_02')
    return Slider.updateOne({ _id: req.params.id }, { $set: extendByKey({}, req.body, editableKeys) }).exec()
}))

// 禁用
router.post('/slider/:id/setDisable', wrap(async req => {
    await permissionService.validatePermission(req, '08_02')
    await Slider.updateOne({ _id: req.params.id }, { $set: { status: 1 } }).exec()
}))

// 启用
router.post('/slider/:id/setEnable', wrap(async req => {
    await permissionService.validatePermission(req, '08_02')
    await Slider.updateOne({ _id: req.params.id }, { $set: { status: 0 } }).exec()
}))

// 删除
router.delete('/slider/:id', wrap(async req => {
    await permissionService.validatePermission(req, '08_02')
    await Slider.updateOne({ _id: req.params.id }, { $set: { status: 2 } }).exec()
}))

export default router
