/**
 * Created by suzitao on 2017/6/26.
 */

import mongoose from 'mongoose'

const Schema = mongoose.Schema

// 托盘
const SliderSchema = new Schema({

    sliderNumber: {
        type: String,
        unique: true,
        required: '编码不能用空',
        trim: true
    },

    name: {
        type: String
    },

    img: {
        type: Schema.Types.ObjectId,
        ref: 'File'
    },

    status: {
        type: Number,
        default: 1,
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

export default mongoose.model('Slider', SliderSchema)
