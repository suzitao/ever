/**
 * 菜鸟快递Api
 * @author jim_
 */
import md5 from '../tools/md5'
import { formatDate } from '../tools/util'
import userConfig from '../../config'
const axios = require('axios')
const base64 = require('base-64')
const querystring = require('querystring')

const EBusinessID = userConfig.kdniao.EBusinessID
const AppKey = userConfig.kdniao.AppKey
// const ReqURL = (process.env.EVERFAST_ENV === 'production') ? 'http://api.kdniao.cc/api/dist' : 'http://testapi.kdniao.cc:8081/api/dist'
const ReqURL = userConfig.kdniao.ReqURL

async function apiCall ({ RequestType, RequestData }) {
    RequestData = JSON.stringify(RequestData)
    const form = {
        RequestType,
        EBusinessID,
        DataType: '2',
        DataSign: base64.encode(md5(RequestData + AppKey)),
        RequestData: encodeURIComponent(RequestData)
    }
    try {
        const { data } = await axios.post(ReqURL, querystring.stringify(form))
        if (!data.Success) {
            throw new Error(data.Reason)
        }
        return data
    } catch (e) {
        console.error(e, e.message)
        throw e
    }
}

export function response (Reason) {
    return {
        EBusinessID,
        UpdateTime: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        Success: !Reason,
        Reason
    }
}

/**
 * 物流查询
 * http://www.kdniao.com/api-track
 * @param {object} RequestData
 * @param  {string} RequestData.ShipperCode - 快递公司编码
 * @param  {string} RequestData.LogisticCode - 物流单号
 * @returns {Promise.<Object>}
 */
export async function orderTrack (RequestData) {
    if (RequestData.ShipperCode === 'YZPY') RequestData.ShipperCode = 'EMS'
    return apiCall({ RequestType: process.env.EVERFAST_ENV === 'production' ? '8001' : '1002', RequestData })
}

/**
 * 物流订阅
 * @export
 * @param {object} RequestData
 * @param {string} RequestData.ShipperCode - 快递公司编码
 * @param {string} RequestData.LogisticCode - 快递单号
 * @returns {Promise.<Object>}
 */
export async function orderSubscribe (RequestData) {
    // if (RequestData.ShipperCode === 'YZPY') RequestData.ShipperCode = 'EMS'
    return apiCall({ RequestType: process.env.EVERFAST_ENV === 'production' ? '8008' : '1008', RequestData })
}
/**
 * 解析推送过来的数据
 * @param {any} data
 * @returns
 */
export async function parsePush (data) {
    const { DataSign, RequestData, RequestType } = data
    if (DataSign !== base64.encode(md5(RequestData + AppKey))) {
        console.log('parsePushError', data)
        throw new Error('DataSign not match!')
    }
    return {
        RequestType,
        RequestData: JSON.parse(RequestData)
    }
}
