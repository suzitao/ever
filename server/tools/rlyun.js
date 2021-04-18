/**
 * 容联云短信Api
 * @author zitao_su
 */
import md5 from '../tools/md5'
import { formatDate } from '../tools/util'
const axios = require('axios')
const base64 = require('base-64')

const baseURL = 'https://app.cloopen.com:8883'
const accountSid = 'XXXXXX'
const authToken = 'XXXXXX'
const appId = 'XXXXXX'

async function apiCall (form, func, funcdes) {
    const { sigParameter, time } = getSigParameter()
    const reqURL = baseURL + `/2013-12-26/Accounts/${accountSid}/${func}/${funcdes}?sig=${sigParameter}`
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json;charset=utf-8',
        'Content-Length': '256',
        'Authorization': base64.encode(accountSid + ':' + time)
    }
    const { data } = await axios.post(reqURL, form, { headers })
    console.log(JSON.stringify(data))
    if (data.statusCode === '000000') return data
    else throw new Error(data.statusMsg)
}

function getSigParameter () {
    const time = formatDate(new Date(), 'yyyyMMddHHmmss')
    const sigParameter = md5(accountSid + authToken + time)
    return {sigParameter, time}
}

export function sendSMS (to, templateId, datas) {
    const form = {
        to: to.join(','),
        appId: appId,
        templateId: templateId,
        datas
    }
    return apiCall(form, 'SMS', 'TemplateSMS')
}
