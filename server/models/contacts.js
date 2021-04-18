/**
 * Created by suzitao on 2017/6/23.
 */

import mongoose from 'mongoose'

const Schema = mongoose.Schema

// 收件人发件人
const ContactsSchema = new Schema({

    // 发件人or收件人
    contactsType: {
        type: Number,
        enum: [0, 1],
        required: true
    },

    // 发货网点
    branch: {
        type: Schema.Types.ObjectId,
        ref: 'Branch'
    },

    // 姓名
    name: {
        type: String,
        required: '联系人姓名不能用空',
        trim: true
    },

    // 身份证号
    idNumber: {
        type: String,
        trim: true
    },

    // 地址
    address: {
        type: [{
            type: String,
            required: true,
            trim: true
        }],
        required: '地址不能为空'
    },

    // 手机号码
    cellphoneNumber: {
        type: String,
        required: '手机号码不能为空',
        trim: true
    },

    // 身份证正面图片
    idCardPositiveImg: {
        type: Schema.Types.ObjectId,
        ref: 'File'
    },

    // 身份证反面图片
    idCardBackImg: {
        type: Schema.Types.ObjectId,
        ref: 'File'
    },

    // 默认
    isDefault: {
        type: Boolean,
        default: false
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
        ref: 'User',
        required: '创建人不能为空'
    }
})

ContactsSchema.index({ status: -1, creator: -1 })

export default mongoose.model('Contacts', ContactsSchema)
