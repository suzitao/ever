/**
 * Created by suzitao on 2017/6/26.
 */

import mongoose from 'mongoose'

const Schema = mongoose.Schema

// 权限项
const SmsRecordSchema = new Schema({
    success: {
        type: Boolean,
        required: true,
        default: false
    },

    smsId: {
        type: String,
        default: ''
    },

    phone: {
        type: String,
        required: true
    },

    message: {
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

    updateTime: {
        type: Date
    }
})

export default mongoose.model('SmsRecord', SmsRecordSchema)
