import { extendByKey } from '../tools/util'
import { PriceType, Branch$PriceType } from '../models'

const priceTypeEditableKeys = ['unitPrice', 'poundSurcharge', 'startingWeight']

// 获取价格类型和价格
export async function getPriceType ({ lineId, branchId, status = 0 }) {
    const priceTypes = await PriceType.find({
        line: lineId,
        status: status
    }).exec()

    return Promise.all(priceTypes.map(async priceType => {
        priceType = priceType.toObject()
        const bpt = await Branch$PriceType.findOne({
            branch: branchId,
            priceType: priceType._id,
            status: status
        })

        if (bpt) {
            for (const key of priceTypeEditableKeys) {
                priceType[key] = bpt[key]
            }
        }

        return priceType
    }))
}

// 更新价格类型和价格
export async function setPriceType ({ branchId, userId }, priceType) {
    const bpt = await Branch$PriceType.findOne({
        branch: branchId,
        priceType: priceType._id,
        status: 0
    }).exec()

    if (bpt) {
        extendByKey(bpt, priceType, priceTypeEditableKeys)
        await bpt.save()
    } else {
        await new Branch$PriceType(extendByKey({
            branch: branchId,
            priceType: priceType._id,
            creator: userId
        }, priceType, priceTypeEditableKeys)).save()
    }
}
