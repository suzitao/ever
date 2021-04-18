import { Router } from 'express'
import axios from 'axios'

import redisClient from '../tools/redis'
import { wrap } from '../tools/util'
import Area from '../models/area'

const router = Router()

const loadAreaList = async type => {
    const areas = await Area.find({parent: null, type}).sort({name: 1}).collation({locale: 'zh'}).lean()
    const getChild = areas => Promise.all(areas.map(async area => {
        const childAreas = await Area.find({parent: area._id}).sort({name: 1}).collation({locale: 'zh'}).lean()
        if (childAreas.length > 0) {
            area.childs = childAreas
            await getChild(area.childs)
        }
    }))
    await getChild(areas)
    return areas
}

router.get('/areas', wrap(async req => {
    const areasCache = await redisClient.getAsync(`areaList:${req.query.type}`)
    if (areasCache) return JSON.parse(areasCache)
    else {
        const areas = await loadAreaList(req.query.type)
        await redisClient.set(`areaList:${req.query.type}`, JSON.stringify(areas))
        return areas
    }
}))

router.get('/areas/async', wrap(async req => {
    await Area.deleteMany({type: 1})
    const proRsl = await axios.get(`http://datavmap-public.oss-cn-hangzhou.aliyuncs.com/areas/csv/100000_province.json`)
    for (const area of proRsl.data.rows) {
        if (area.name.indexOf('香港') < 0 && area.name.indexOf('澳門') < 0 && area.name.indexOf('澳门') < 0 && area.name.indexOf('台湾') < 0) {
            await new Area({
                areaNumber: area.adcode,
                name: area.name,
                parent: null,
                type: 1,
                creator: req.user._id
            }).save()
        }
    }
    const cityRsl = await axios.get(`http://datavmap-public.oss-cn-hangzhou.aliyuncs.com/areas/csv/100000_city.json`)
    for (const area of cityRsl.data.rows) {
        const proParent = await Area.findOne({name: area.parent})
        if (proParent) {
            await new Area({
                areaNumber: area.adcode,
                name: area.name,
                parent: proParent,
                type: 1,
                creator: req.user._id
            }).save()
        }
    }
    const distRsl = await axios.get(`http://datavmap-public.oss-cn-hangzhou.aliyuncs.com/areas/csv/100000_district.json`)
    for (const area of distRsl.data.rows) {
        const proCity = await Area.findOne({name: area.parent})
        if (proCity) {
            await new Area({
                areaNumber: area.adcode,
                name: area.name,
                parent: proCity,
                type: 1,
                creator: req.user._id
            }).save()
        }
    }
    await redisClient.set(`areaList:0`, JSON.stringify(await loadAreaList(0)))
    await redisClient.set(`areaList:1`, JSON.stringify(await loadAreaList(1)))
}))

export default router
