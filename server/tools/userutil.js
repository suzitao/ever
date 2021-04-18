import User from '../models/user'
import CapitalDetail from '../models/capitalDetail'

// 余额增减
export async function accountAmountChange (account, amount) {
    const exp = /^-?([1-9][\d]{0,7}|0)(\.[\d]{1,2})?$/
    if (!exp.test(amount)) {
        throw new Error('请输入正确的金额(大于0且小数点后不超过2位)')
    }
    const user = await getAccountAmount(account)
    await User.updateOne({ _id: account }, { $set: { accountAmount: (Number(user.accountAmount) + Number(amount)).toFixed(2) } }).exec()
}

export async function getAccountAmount (userId) {
    const user = await User.findOne({ _id: userId, status: 0, isAdmin: false }, { accountAmount: 1, _id: 0 })
    if (!user) {
        throw new Error(`不存在该用户或该用户已禁用`)
    }
    const capitalDetial = await CapitalDetail.findOne({ account: userId, status: 0 }, { balance: 1 }).sort({createTime: -1})
    let capitalDetialBalance = 0
    if (capitalDetial) {
        if (capitalDetial[0]) {
            capitalDetialBalance = capitalDetial[0].balance
        }
        capitalDetialBalance = capitalDetial.balance
    }
    if (capitalDetialBalance !== user.accountAmount) {
        throw new Error(`客户用户${userId}账户余额数据错误`)
    }
    return user
}

// 根据用户统计充值金额
export const countRechangeAmountByAccount = async (accountId) => {
    const result = await CapitalDetail.aggregate([{ $match: { account: accountId, recordType: {$in: [30, 40]} } }, { $group: { _id: '$countRechangeAmountByAccount', value: { $sum: '$balanceChangeAmount' } } }])
    return result[0] ? Number(result[0].value.toFixed(2)) : 0
}
