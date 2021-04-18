/**
 * Created by suzitao on 2017/6/26.
 */

import mongoose from 'mongoose'

const Schema = mongoose.Schema

// 地区
const AreaSchema = new Schema({

    areaNumber: {
        type: String,
        unique: true,
        required: '编码不能用空',
        trim: true
    },

    name: {
        type: String
    },

    // 父节点
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'Area'
    },

    // 0发件地区 1收件地区
    type: {
        type: Number,
        enum: [0, 1]
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

export default mongoose.model('Area', AreaSchema)
