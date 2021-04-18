/**
 * Created by suzitao on 2017/6/26.
 */
import mongoose from 'mongoose'

const Schema = mongoose.Schema

const CapitalDetailSchema = new Schema({

    capitalDetailNumber: {
        type: String,
        unique: true,
        required: '编码不能用空',
        trim: true
    },

    // 对应账户
    account: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    order: {
        type: Schema.Types.ObjectId,
        ref: 'Order'
    },

    branch: {
        type: Schema.Types.ObjectId,
        ref: 'Branch'
    },

    // 发生金额
    amount: {
        type: Number
    },

    // 其他方式收支
    otherChangeAmount: {
        type: Number
    },

    // 余额收支
    balanceChangeAmount: {
        type: Number
    },

    // 余额
    balance: {
        type: Number
    },

    // 类型
    recordType: {
        type: Number,
        // 10支付运费 15支付运费(含税) 20支付关税 30充值 40提现 50退款 60保险赔款
        enum: [10, 15, 20, 30, 40, 50, 60]
    },

    // 方式
    occurMethod: {
        type: Number,
        // 10现金 20POS 30账户余额 35赊欠 40支付宝转账 45微信转账 50预留支付宝支付 55预留微信支付 60汇款 65支票 70其它
        enum: [10, 20, 30, 35, 40, 45, 50, 55, 60, 65, 70]
    },

    // 说明
    illustration: {
        type: String
    },

    status: {
        type: Number,
        default: 0,
        enum: [0, 1, 2]
    },

    createTime: {
        type: Date,
        default: Date.now
    },

    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

export default mongoose.model('CapitalDetail', CapitalDetailSchema)
