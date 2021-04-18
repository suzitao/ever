/**
 * Created by suzitao on 2017/6/26.
 */

import mongoose from 'mongoose'

const Schema = mongoose.Schema

// 权限项
const PermissionItemSchema = new Schema({
    permissionItemNumber: {
        type: String,
        required: '权限项编码不能为空',
        unique: true,
        trim: true
    },

    name: {
        type: String,
        required: '权限项名称不能为空',
        unique: true,
        trim: true
    },

    status: {
        type: Number,
        default: 0,
        enum: [0, 1, 2]
    }
})

export default mongoose.model('PermissionItem', PermissionItemSchema)
