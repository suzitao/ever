/**
 * Created by zitao_su on 2017/6/27.
 */
import mongoose from 'mongoose'

const Schema = mongoose.Schema

// 常用物品信息
const CommonGoodsSchema = new Schema({

    // 物品名称
    name: {
        type: String,
        required: '物品名称不能用空',
        trim: true
    },

    // 品牌
    brand: {
        type: String,
        trim: true
    },

    // 申报单价
    valueDeclared: {
        type: Number,
        required: '请输入物品申报单价'
    },

    // 规格
    measurementUnit: {
        type: String,
        required: '物品规格不能用空',
        trim: true
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
        ref: 'User',
        required: '创建人不能为空'
    }
})

CommonGoodsSchema.index({ status: -1, createTime: -1 })

export default mongoose.model('CommonGoods', CommonGoodsSchema)
