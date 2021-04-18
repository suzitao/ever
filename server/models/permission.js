/**
 * Created by suzitao on 2017/6/26.
 */

import mongoose from 'mongoose'

const Schema = mongoose.Schema

// 用户-网点-权限项
const PermissionSchema = new Schema({

    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    branch: {
        type: Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    },

    permissionItems: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'PermissionItem',
            required: true
        }],
        default: []
    }
})

export default mongoose.model('Permission', PermissionSchema)
