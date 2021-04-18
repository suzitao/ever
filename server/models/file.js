/**
 * Created by jim on 6/26/2017.
 */
import mongoose from 'mongoose'

const Schema = mongoose.Schema

// 附件
const FileSchema = new Schema({

    // 文件md5
    fileHash: {
        type: String,
        require: true
    },
    mimetype: {
        type: String
    },
    size: {
        type: Number
    },
    originalname: {
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
    // 备注
    remark: {
        type: String
    }
})

export default mongoose.model('File', FileSchema)
