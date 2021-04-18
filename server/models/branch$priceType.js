/**
 * Created by suzitao on 2017/6/26.
 */

import mongoose from 'mongoose'

const Schema = mongoose.Schema

const Branch$PriceTypeSchema = new Schema({

    branch: {
        type: Schema.Types.ObjectId,
        ref: 'Branch',
        require: '网点不能为空'
    },

    priceType: {
        type: Schema.Types.ObjectId,
        ref: 'PriceType',
        require: '价格类型不能为空'
    },

    // 单价
    unitPrice: {
        type: Number,
        require: '单价不能为空'
    },

    // 首磅附加费
    poundSurcharge: {
        type: Number,
        default: 0
    },

    // 最低计费重量
    startingWeight: {
        type: Number,
        default: 0
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

    updateTime: {
        type: Date,
        default: Date.now
    },

    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    updator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

Branch$PriceTypeSchema.index({ branch: -1, priceType: -1 })

export default mongoose.model('BranchPriceType', Branch$PriceTypeSchema)
