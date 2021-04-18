import mongoose from 'mongoose'

const Schema = mongoose.Schema

// 物流跟踪信息
const ShipmentDetailSchema = new Schema({

    // 是否快鸟推送过来的信息,如果是则存在traces为推送过来的物流信息
    isKn: {
        type: Boolean,
        default: false
    },

    traces: {
        type: Array
    },

    // 对应订单
    order: {
        type: Schema.Types.ObjectId,
        ref: 'Order'
    },

    information: {
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
    },

    updateTime: {
        type: Date
    }
})

ShipmentDetailSchema.index({ status: -1, createTime: -1 })

export default mongoose.model('ShipmentDetail', ShipmentDetailSchema)
