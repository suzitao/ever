import mongoose from 'mongoose'

const Schema = mongoose.Schema

// 价格类型
const PriceTypeSchema = new Schema({

    index: {
        type: Number,
        required: true
    },

    name: {
        type: String
    },

    // 归属线路
    line: {
        type: Schema.Types.ObjectId,
        ref: 'Line',
        required: true
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
        type: Date,
        default: Date.now
    },

    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    updator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

export default mongoose.model('PriceType', PriceTypeSchema)
