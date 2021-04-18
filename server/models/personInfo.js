/**
 * Created by suzitao on 2017/6/23.
 */

import mongoose from 'mongoose'

const Schema = mongoose.Schema

// 收件人发件人
const PersonInfoSchema = new Schema({

    // 姓名
    name: {
        type: String,
        required: true
    },

    // 手机号码
    cellphoneNumber: {
        type: String,
        required: true
    },

    // 身份证号
    idNumber: {
        type: String
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

    status: {
        type: Number,
        default: 0,
        enum: [0, 1, 2]
    },

    createTime: {
        type: Date,
        default: Date.now
    },

    // account: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'User'
    // }
})

PersonInfoSchema.index({ status: -1, creator: -1 })

export default mongoose.model('PersonInfo', PersonInfoSchema)
