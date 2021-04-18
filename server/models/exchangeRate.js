/**
 * Created by suzitao on 2017/6/26.
 */

import mongoose from 'mongoose'

const Schema = mongoose.Schema

// 汇率
const ExchangeRateSchema = new Schema({

    // 汇率值
    value: {
        type: Number,
        required: '汇率值不能用空'
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

export default mongoose.model('ExchangeRate', ExchangeRateSchema)
