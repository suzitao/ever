/**
 * Created by suzitao on 2017/6/26.
 */

import mongoose from 'mongoose'

const Schema = mongoose.Schema

// 权限项
const SystemSchema = new Schema({
    systemNumber: {
        type: String,
        required: '系统项编码不能为空',
        unique: true,
        trim: true
    },

    name: {
        type: String,
        required: '系统项名称不能为空',
        unique: true,
        trim: true
    },

    value: {
        type: Schema.Types.Mixed
    },

    status: {
        type: Number,
        default: 0,
        enum: [0, 1, 2]
    }
})

export default mongoose.model('System', SystemSchema)
