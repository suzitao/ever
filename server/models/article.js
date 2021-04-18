/**
 * Created by suzitao on 2017/6/23.
 */
import mongoose from 'mongoose'

const Schema = mongoose.Schema

// 托盘
const ArticleSchema = new Schema({

    articleNumber: {
        type: String,
        unique: true,
        required: '编码不能用空',
        trim: true
    },

    title: {
        type: String,
        required: true
    },

    html: {
        type: String,
        required: true
    },

    type: {
        type: Number,
        default: 0,
        enum: [0, 1, 2, 3]
    },

    headImg: {
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

export default mongoose.model('Article', ArticleSchema)
