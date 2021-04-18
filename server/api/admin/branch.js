/**
 * Created by jim on 6/24/2017.
 */
import { Router } from 'express'
import { Branch, User } from '../../models'

import * as lineService from '../../services/line'
import * as permissionService from '../../services/permission'

import { wrap, extendByKey } from '../../tools/util'
import { queryList } from '../../tools/dbutil'

const router = Router()
const editableKeys = ['branchNumber', 'simpleCode', 'name', 'address', 'phoneNumber', 'isSales', 'isHub', 'isDefault']

router.get('/branchs', wrap(async req => {
    await permissionService.validatePermission(req, '08_03')
    const { pageNo, pageSize, mixSearch } = req.query
    const query = { status: { $in: [0, 1] } }
    if (mixSearch) {
        query.$or = [
            { branchNumber: new RegExp(mixSearch, 'i') },
            { name: new RegExp(mixSearch, 'i') }
        ]
    }
    return queryList({
        model: Branch,
        query,
        sort: { createTime: -1 },
        populate: [
            { path: 'lineList', select: 'name' }
        ],
        pageNo: parseInt(pageNo),
        pageSize: parseInt(pageSize)
    })
}))

// 获取店铺范围和当前店铺
router.get('/branchs/branchRanges', wrap(async req => {
    const user = await User.findOne({ _id: req.user._id }).populate([
        { path: 'branchRanges' },
        { path: 'defaultBranch' }
    ]).exec()
    if (!user) throw new Error('用户不存在')
    let branchRanges
    if (req.user.username === 'admin') {
        branchRanges = await Branch.find({ status: { $in: [0, 1] } }).sort({ createTime: -1 }).exec()
    } else {
        branchRanges = user.branchRanges
    }
    if (!req.session.currentBranchId || branchRanges.map(branch => branch._id.toString()).indexOf(req.session.currentBranchId) === -1) {
        if (user.defaultBranch) {
            req.session.currentBranchId = user.defaultBranch._id
        } else if (user.branchRanges.length > 0) {
            req.session.currentBranchId = user.branchRanges[0]._id
        } else {
            throw new Error('获取当前店铺出错')
        }
    }
    let currentBranch
    for (const branch of branchRanges) {
        if (branch._id.toString() === req.session.currentBranchId) {
            currentBranch = branch
            break
        }
    }
    return {
        branchRanges: branchRanges,
        currentBranch: currentBranch
    }
}))

// 获取当前店铺信息
router.get('/branchs/current', wrap(async req => {
    return Branch.findById(req.session.currentBranchId).populate([
        { path: 'lineList', select: 'name' }
    ]).exec()
}))

// 切换店铺
router.post('/branchs/switch/:id', wrap(async req => {
    const user = await User.findOne({ _id: req.user._id }).exec()
    if (user.username !== 'admin' && user.branchRanges.indexOf(req.params.id) === -1) {
        throw new Error('你没有权限切换到本网点')
    }
    req.session.currentBranchId = req.params.id
}))

// 新增店铺
router.post('/branchs', wrap(async req => {
    await permissionService.validatePermission(req, '08_03')
    if (req.body.isDefault) {
        await Branch.update({ isDefault: true }, { $set: { isDefault: false } }).exec()
    }
    return new Branch(extendByKey({
        creator: req.user._id
    }, req.body, editableKeys)).save()
}))

// 修改店铺
router.post('/branchs/:id', wrap(async req => {
    await permissionService.validatePermission(req, '08_03')
    if (req.body.isDefault) {
        await Branch.update({ isDefault: true }, { $set: { isDefault: false } }).exec()
    }
    const branch = await Branch.findById(req.params.id).exec()
    extendByKey(branch, req.body, editableKeys)
    return branch.save()
}))

// 设置线路
router.post('/branchs/:id/setLineList', wrap(async req => {
    return Branch.updateOne({ _id: req.params.id }, { $set: { lineList: req.body.lineList } }).exec()
}))

// 获取价格类型和价格
router.get('/branchs/:id/priceType', wrap(async req => {
    const branchId = req.params.id
    const branch = await Branch.findOne({
        _id: branchId
    }).select('lineList').populate('lineList')

    const lines = []

    for (let line of branch.lineList) {
        line = line.toObject()
        line.priceTypes = await lineService.getPriceType({
            lineId: line._id,
            branchId: branchId
        })
        lines.push(line)
    }
    return lines
}))

// 设置价格
router.post('/branchs/:id/priceType', wrap(async req => {
    const data = req.body
    const lineIds = Object.keys(data)

    for (const lineId of lineIds) {
        const priceTypes = data[lineId]
        for (let priceType of priceTypes) {
            // 更新或插入价格
            await lineService.setPriceType({
                branchId: req.params.id,
                userId: req.user._id
            }, priceType)
        }
    }
}))

// 禁用
router.post('/branchs/:id/setDisable', wrap(async req => {
    await permissionService.validatePermission(req, '08_03')
    const branch = await Branch.findById(req.params.id)
    branch.status = 1
    await branch.save()
}))

// 启用
router.post('/branchs/:id/setEnable', wrap(async req => {
    await permissionService.validatePermission(req, '08_03')
    const branch = await Branch.findById(req.params.id)
    branch.status = 0
    await branch.save()
}))

// 删除店铺
router.delete('/branchs/:id', wrap(async req => {
    await permissionService.validatePermission(req, '08_03')
    const branch = await Branch.findById(req.params.id)
    branch.status = 2
    await branch.save()
}))

export default router
