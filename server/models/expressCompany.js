/**
 * Created by suzitao on 2017/6/26.
 */

import mongoose from 'mongoose'

const Schema = mongoose.Schema

// 快递公司
const ExpressCompanySchema = new Schema({

    expressCompanyNumber: {
        type: String,
        unique: true,
        required: '编码不能用空',
        trim: true
    },

    name: {
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

    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

export default mongoose.model('ExpressCompany', ExpressCompanySchema)
