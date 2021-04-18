import User from '../models/user'
import CapitalDetail from '../models/capitalDetail'
import { extendByKey } from '../tools/util'

// 增加充值/提现记录
export async function addRechangeWithdrawalsRecord (data, creator) {
    const editableKeys = ['account', 'branch', 'occurMethod', 'illustration']
    const exp = /^-?([1-9][\d]{0,7}|0)(\.[\d]{1,2})?$/
    if (!exp.test(data.amount)) {
        throw new Error('请输入正确的金额(大于0且小数点后不超过2位)')
    }
    const user = await User.findOne({ _id: data.account, status: 0, isAdmin: false })
    if (!user) {
        throw new Error(`不存在该用户或该用户已禁用`)
    }
    const capitalDetial = await CapitalDetail.findOne({ account: data.account, status: 0 }, { balance: 1 }).sort({createTime: -1})
    let capitalDetialBalance = 0
    if (capitalDetial) {
        capitalDetialBalance = capitalDetial.balance
    }
    const capitalDetailNumber = String(Date.now())
    if (data.amount !== 0) {
        await new CapitalDetail(extendByKey({ capitalDetailNumber: capitalDetailNumber, creator: creator, amount: Math.abs(data.amount), recordType: data.amount > 0 ? 30 : 40, otherChangeAmount: data.amount, balanceChangeAmount: data.amount, balance: (Number(capitalDetialBalance) + Number(data.amount)).toFixed(2) }, data, editableKeys)).save()
    }
}

// 增加账户余额消费记录
export async function addConsumptionRecord (data, creator) {
    const editableKeys = ['account', 'order', 'branch', 'recordType', 'illustration']
    const exp = /^-?([1-9][\d]{0,7}|0)(\.[\d]{1,2})?$/
    if (!exp.test(data.amount)) {
        throw new Error('请输入正确的金额(大于0且小数点后不超过2位)')
    }
    const user = await User.findOne({ _id: data.account, status: 0, isAdmin: false })
    if (!user) {
        throw new Error(`不存在该用户或该用户已禁用`)
    }
    const capitalDetial = await CapitalDetail.findOne({ account: data.account, status: 0 }, { balance: 1 }).sort({createTime: -1})
    let capitalDetialBalance = 0
    if (capitalDetial) {
        if (capitalDetial[0]) {
            capitalDetialBalance = capitalDetial[0].balance
        }
        capitalDetialBalance = capitalDetial.balance
    }
    const capitalDetailNumber = String(Date.now())
    if (data.amount !== 0) {
        await new CapitalDetail(extendByKey({ capitalDetailNumber: capitalDetailNumber, creator: creator, amount: Math.abs(data.amount), occurMethod: (Number(capitalDetialBalance) - Number(data.amount)) > 0 ? 30 : 35, otherChangeAmount: 0, balanceChangeAmount: (Number(data.amount) * -1).toFixed(2), balance: (Number(capitalDetialBalance) - Number(data.amount)).toFixed(2) }, data, editableKeys)).save()
    }
}
