/**
 * Created by suzitao on 2017/6/26.
 */

import mongoose from 'mongoose'

const Schema = mongoose.Schema

// 线路
const LineSchema = new Schema({

    lineNumber: {
        type: String,
        unique: true,
        required: '编码不能用空',
        trim: true
    },

    name: {
        type: String
    },
    // 线路说明
    description: {
        type: String
    },

    // 关税类型 0后付 1预付 3包税
    tariffType: {
        type: String,
        enum: [0, 1, 2]
    },

    administrator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    // 是否支持保价
    isSupportValueDeclared: {
        type: Boolean,
        default: false
    },

    // 保险费率
    valueDeclaredRate: {
        type: Number,
        min: 0.01,
        default: 0.01
    },

    // 默认保额
    defaultCoverage: {
        type: Number,
        min: 0,
        default: 0
    },

    /// 最高保额
    maxCoverage: {
        type: Number,
        min: 0,
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

    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

export default mongoose.model('Line', LineSchema)
