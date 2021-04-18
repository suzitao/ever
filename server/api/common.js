
import { Router } from 'express'
import { wrap } from '../tools/util'
import md5 from '../tools/md5'
import redisClient from '../tools/redis'
import { System, SmsRecord } from '../models'

const router = Router()
const axios = require('axios')
const querystring = require('querystring')

// 获取地址信息
router.get('/common/address', wrap(async req => {
    const sk = '6W6PLZNCwNaIrl6GXD0s7S16Cx73xo5K'
    const ak = 'eqhnOoKoVFhYZkNQ7k4liMVm54145uAz'
    const add = req.query.address
    const uri = '/geocoder/v2/?'
    const params = {
        address: req.query.address,
        output: 'json',
        ak
    }
    const paramsStr = querystring.stringify(params)
    const wholeStr = uri + paramsStr + sk
    const tempStr = encodeURIComponent(wholeStr)
    const sn = md5(tempStr)
    const url = `https://api.map.baidu.com/geocoder/v2/?address=${add}&output=json&ak=${ak}&sn=${sn}`
    let getRes
    try {
        getRes = await axios.get(url)
    } catch (error) {
    }
    console.log(getRes)
    // const result2 = await axios.get(`https://api.map.baidu.com/geocoder/v2/?callback=renderReverse&location=${result.location.lat},${result.location.lng}&output=json&pois=1&ak=eqhnOoKoVFhYZkNQ7k4liMVm54145uAz`)

    return url
}))

// 获取地址信息
router.get('/common/progress/:id', wrap(async req => {
    const rsl = await redisClient.getAsync(`progressId:${req.params.id}`)
    return JSON.parse(rsl)
}))

// 云之讯回调
router.post('/common/ucpaas/resultPush', wrap(async req => {
    console.log(JSON.stringify(req.body))
    const { code, msg, smsid, mobile, uid } = req.body
    if (uid === 'ucpassucpassucpassucpass0023456') {
        const record = await SmsRecord.findOne({ smsId: smsid })
        if (record) {
            record.success = (code === '0')
            record.message = msg
            record.updateTime = Date.now()
            await record.save()
        } else {
            await new SmsRecord({
                success: code === '0',
                smsId: smsid,
                phone: mobile,
                message: msg,
                updateTime: Date.now()
            }).save()
        }
        if (code === '0') {
            let system = await System.findOne({ systemNumber: 'sms02' })
            if (!system) system = new System({ systemNumber: 'sms02', name: '短信发送成功数量', value: 0 })
            system.value++
            await system.save()
        } else {
            let system = await System.findOne({ systemNumber: 'sms03' })
            if (!system) system = new System({ systemNumber: 'sms03', name: '短信发送失败数量', value: 0 })
            system.value++
            await system.save()
        }
    }
}))

export default router
