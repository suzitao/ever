/**
 * Created by suzitao on 2017/6/26.
 */

import mongoose from 'mongoose'

const Schema = mongoose.Schema

// 权限项
const TraceUpdateRecord = new Schema({
    total: {
        type: Number,
        required: true
    },

    successCount: {
        type: Number,
        required: true,
        default: 0
    },

    failCount: {
        type: Number,
        required: true,
        default: 0
    },

    createTime: {
        type: Date,
        default: Date.now
    },

    finishTime: {
        type: Date
    }
})

export default mongoose.model('traceUpdateRecord', TraceUpdateRecord)
