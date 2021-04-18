/**
 * Created by jim on 6/23/2017.
 */
import mongoose from 'mongoose'

const Schema = mongoose.Schema

// 店铺
const BranchSchema = new Schema({

    branchNumber: {
        type: String,
        unique: true,
        required: '编码不能用空',
        trim: true
    },

    // 店铺简码
    simpleCode: {
        type: String,
        unique: true,
        required: '简码不能用空',
        trim: true,
        match: /^[A-Z]{2}$/
    },

    // 名称
    name: {
        type: String,
        required: true
    },

    // 地址
    address: {
        type: String
    },

    // 线路
    lineList: [{
        type: Schema.Types.ObjectId,
        ref: 'Line'
    }],

    // 电话(数组:可能有多个电话)
    phoneNumber: {
        type: [String]
    },

    isSales: {
        type: Boolean,
        default: false
    },

    isHub: {
        type: Boolean,
        default: false
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
        ref: 'User'
    }

})

BranchSchema.index({status: -1, createTime: -1})

export default mongoose.model('Branch', BranchSchema)
