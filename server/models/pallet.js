/**
 * Created by suzitao on 2017/6/23.
 */
import mongoose from 'mongoose'

const Schema = mongoose.Schema

// 托盘
const PalletSchema = new Schema({

    palletNumber: {
        type: String,
        unique: true,
        required: '编码不能用空',
        trim: true
    },

    // 网点
    branch: {
        type: Schema.Types.ObjectId,
        ref: 'Branch'
    },

    // 重量
    weight: {
        type: Number,
        default: 0
    },

    // 线路列表
    lineList: [{
        type: Schema.Types.ObjectId,
        ref: 'Line'
    }],

    // 装盘-封盘-出发-到达-开始清关-清关完毕
    state: {
        type: Number,
        default: 10,
        enum: [10, 20, 30, 35, 40, 50, 60]
    },

    // 空运价格
    airFreightPrice: {
        type: Number
    },

    // 提单号
    ladingBillNumber: {
        type: String
    },

    // 网点备注
    remark: {
        type: String
    },

    // 清关备注
    clearanceRemark: {
        type: String
    },

    // 附件
    fileList: [{
        type: Schema.Types.ObjectId,
        ref: 'File'
    }],

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

export default mongoose.model('Pallet', PalletSchema)
