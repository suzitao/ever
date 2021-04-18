
import { Router } from 'express'

import { User, CapitalDetail, Permission } from '../../models'

import * as permissionService from '../../services/permission'

import { wrap, extendByKey } from '../../tools/util'
import { accountAmountChange, getAccountAmount, countRechangeAmountByAccount } from '../../tools/userutil'
import { countOrderAmountByAccount, countOrderTrafficByAccount } from '../../tools/orderutil'
import { addRechangeWithdrawalsRecord } from '../../tools/capitaldetailutil'
import { queryList2 } from '../../tools/dbutil'

const router = Router()
const editableKeys = ['username', 'realname', 'email', 'cellphoneNumber', 'usernameLowerCase', 'branchRanges', 'defaultBranch']

router.get('/user', wrap(async (req, res) => {
    const { isAdmin, mixSearch, status = [0, 1] } = req.query
    if (isAdmin === true || isAdmin === 'true') await permissionService.validatePermission(req, '07_01')
    else if (isAdmin === false || isAdmin === 'false') await permissionService.validatePermission(req, '06_01')
    else throw new Error('请传入正确参数isAdmin')
    const query = { status: { $in: status }, isAdmin }
    if (mixSearch) {
        query.$or = [
            { username: new RegExp(mixSearch, 'i') },
            { realname: new RegExp(mixSearch, 'i') },
            { email: new RegExp(mixSearch, 'i') },
            { cellphoneNumber: new RegExp(mixSearch, 'i') }
        ]
    }

    const result = await queryList2(User, req, {
        query,
        select: '-password',
        sort: { createTime: -1 }
    })
    if (req.query.isCustomerList) {
        result.list = await Promise.all(result.list.map(async user => {
            user = user.toObject()
            user['orderAmount'] = await countOrderAmountByAccount(user._id)
            user['orderTraffic'] = await countOrderTrafficByAccount(user._id)
            user['rechangeAmount'] = await countRechangeAmountByAccount(user._id)
            return user
        }))
    }
    return result
}))

// 客户余额
router.get('/user/totalBalance', wrap(async req => {
    await permissionService.validatePermission(req, '05_01')
    const result = await User.aggregate([{ $match: {isAdmin: false, accountAmount: {$gt: 0}} }, { $group: { _id: 'totalBalance', value: { $sum: '$accountAmount' } } }])
    return result[0] ? result[0].value : 0
}))

// 客户欠款
router.get('/user/totalDebts', wrap(async req => {
    await permissionService.validatePermission(req, '05_01')
    const result = await User.aggregate([{ $match: {isAdmin: false, accountAmount: {$lt: 0}} }, { $group: { _id: 'totalDebts', value: { $sum: '$accountAmount' } } }])
    return result[0] ? result[0].value : 0
}))

// 获取用户信息
router.get('/user/:id', wrap(async req => {
    const user = await User.findById(req.params.id).exec()
    user.password = undefined
    return user
}))

// 获取用户权限
router.get('/user/:id/getUserPermission', wrap(async req => {
    await permissionService.validatePermission(req, '07_01')
    return Permission.find({user: req.params.id}).exec()
}))

// 批量启用用户
router.post('/user/setBatchEnable', wrap(async req => {
    if (!req.user.isAdministrator) throw new Error('请使用admin用户操作')
    const { userIdList } = req.body
    await Promise.all(userIdList.map(async id => {
        await User.updateOne({ _id: id }, { $set: { status: 0 } }).exec()
    }))
}))
// 批量禁用用户
router.post('/user/setBatchDisable', wrap(async req => {
    if (!req.user.isAdministrator) throw new Error('请使用admin用户操作')
    const { userIdList } = req.body
    await Promise.all(userIdList.map(async id => {
        await User.updateOne({ _id: id }, { $set: { status: 1 } }).exec()
    }))
}))
// 批量删除用户
router.post('/user/setBatchDelete', wrap(async req => {
    if (!req.user.isAdministrator) throw new Error('请使用admin用户操作')
    const { userIdList } = req.body
    await Promise.all(userIdList.map(async id => {
        await User.updateOne({ _id: id }, { $set: { status: 2 } }).exec()
    }))
}))

// 设置用户权限
router.post('/user/:id/setUserPermission', wrap(async req => {
    if (!req.user.isAdministrator) throw new Error('请使用admin用户操作')
    return Promise.all(req.body.map(async item => {
        let _item = await Permission.findOne({user: req.params.id, branch: item.branch}).exec()
        if (_item) {
            _item.permissionItems = item.permissionItems
        } else {
            _item = new Permission({
                user: req.params.id,
                branch: item.branch,
                permissionItems: item.permissionItems
            })
        }
        return _item.save()
    }))
}))

// 新增员工
router.post('/user', wrap(async req => {
    if (!req.user.isAdministrator) throw new Error('请使用admin用户操作')
    req.body.usernameLowerCase = req.body.username.toLowerCase()
    return new User(extendByKey({
        creator: req.user._id,
        password: req.body.email,
        isAdmin: true
    }, req.body, editableKeys)).save()
}))

// 修改员工信息
router.post('/user/:id', wrap(async req => {
    if (!req.user.isAdministrator) throw new Error('请使用admin用户操作')
    req.body.usernameLowerCase = req.body.username.toLowerCase()
    const user = await User.findById(req.params.id).exec()
    if (user) {
        if (user.isAdmin && req.body.branchRanges.indexOf(req.body.defaultBranch) === -1) {
            throw new Error('数据错误')
        }
        user.set(extendByKey({}, req.body, editableKeys))
        await user.save()
    }
}))

// 禁用员工
router.post('/user/:id/setDisable', wrap(async req => {
    if (!req.user.isAdministrator) throw new Error('请使用admin用户操作')
    await User.updateOne({ _id: req.params.id }, { $set: { status: 1 } }).exec()
}))

// 启用员工
router.post('/user/:id/setEnable', wrap(async req => {
    if (!req.user.isAdministrator) throw new Error('请使用admin用户操作')
    await User.updateOne({ _id: req.params.id }, { $set: { status: 0 } }).exec()
}))

// 删除用户
router.post('/user/:id/setDelete', wrap(async req => {
    if (!req.user.isAdministrator) throw new Error('请使用admin用户操作')
    await User.updateOne({ _id: req.params.id }, { $set: { status: 2 } }).exec()
}))

// 重置密码
router.post('/user/:id/resetPassword', wrap(async req => {
    if (!req.user.isAdministrator) throw new Error('请使用admin用户操作')
    const user = await User.findById(req.params.id).exec()
    console.log(user.username, user.email)
    if (user) {
        user.set('password', user.email)
        await user.save()
    }
}))

// 正数充值/负数提现
router.post('/user/:id/recahnge', wrap(async req => {
    await permissionService.validatePermission(req, '06_03')
    const user = await getAccountAmount(req.params.id)
    if (((Number(user.accountAmount) + Number(req.body.amount)) < 0) && Number(req.body.amount) < 0) {
        throw new Error(`提现金额不能大于账户余额`)
    }
    await accountAmountChange(req.params.id, req.body.amount)
    await addRechangeWithdrawalsRecord({
        account: req.params.id,
        branch: req.session.currentBranchId,
        amount: req.body.amount,
        occurMethod: req.body.occurMethod,
        illustration: req.body.illustration
    }, req.user._id)
}))

// 重算账户余额
router.get('/user/:id/recalCulation', wrap(async req => {
    const user = await User.findOne({ _id: req.params.id, status: 0, isAdmin: false })
    if (!user) throw new Error(`不存在该用户或该用户已禁用`)
    user.set('accountAmount', 0)
    const capitalDetails = await CapitalDetail.find({ account: req.params.id, status: 0 }).sort({createTime: 1})
    for (let i = 0; i < capitalDetails.length; i++) {
        capitalDetails[i].set('balance', (Number(user.accountAmount) + Number(capitalDetails[i].balanceChangeAmount)).toFixed(2))
        if ([10, 15, 20].indexOf(capitalDetails[i].recordType) !== -1 && [30, 35].indexOf(capitalDetails[i].occurMethod) !== -1) {
            if (Number(capitalDetails[i].balance) < 0) {
                capitalDetails[i].set('occurMethod', 35)
            } else {
                capitalDetails[i].set('occurMethod', 30)
            }
        }
        user.set('accountAmount', capitalDetails[i].balance)
        console.log('capitalbalance', capitalDetails[i].balance)
        console.log('userbalance', user.accountAmount)
        await capitalDetails[i].save()
    }
    await user.save()
}))

// 查询重复付款记录
// db.getCollection('capitaldetails').aggregate([{$match : {account: ObjectId("5a049f397755fe36e955d5e9"), recordType: {$in: [10, 15]}}},{$group : {_id : "$order", count : {$sum : 1}}}, {$match : {count: {$gt: 1}}}])

export default router
