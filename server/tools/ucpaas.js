import axios from 'axios'
import { SmsRecord } from '../models'

const sid = 'XXXXXX'
const token = 'XXXXXX'
const appid = 'XXXXXX'
const baseURL = 'https://open.ucpaas.com/ol/sms/'
const uid = 'XXXXXX'

async function apiCall (form, func) {
    const reqURL = baseURL + func
    form.sid = sid
    form.token = token
    form.appid = appid
    form.uid = uid
    const headers = {
        'Content-Type': 'application/json;charset=utf-8',
        'Accept': 'application/json'
    }
    const { data } = await axios.post(reqURL, form, headers)
    console.log(JSON.stringify(data))
    if (data.code === '000000') return data
    else throw new Error(data.msg)
}

export async function sendSMS (to, templateId, param) {
    const form = {
        mobile: to.join(','),
        templateid: templateId,
        param: param.join(',')
    }
    try {
        const res = await apiCall(form, 'sendsms_batch')
        for (let item of res.report) {
            const { smsid, mobile, msg } = item
            if (item.code === '000000') {
                await new SmsRecord({
                    smsId: smsid,
                    phone: mobile,
                    message: msg
                }).save()
            } else {
                await new SmsRecord({
                    phone: mobile,
                    message: msg
                }).save()
            }
        }
        return res
    } catch (e) {
        for (let item of to) {
            await new SmsRecord({
                phone: item,
                message: e.message
            }).save()
        }
        throw e
    }
}
