import axios from 'axios'
import iconv from 'iconv-lite'
import xml2js from 'xml2js'

import { promiseOrCallback } from '../tools/util'

export const orderTrack = async billCode => {
    const oriData = await apiCall(billCode)
    const resultData = {
        LogisticCode: oriData.root.track[0].billcode[0],
        ShipperCode: 'STO',
        Traces: [],
        State: '0'
    }
    if (oriData.root.track[0].detail && oriData.root.track[0].detail.length) {
        const oriState = oriData.root.track[0].detail[oriData.root.track[0].detail.length - 1].scantype.toString()
        if (oriState === '收件') resultData.State = '1'
        else if (oriState === '签收') resultData.State = '3'
        else if (oriState === '问题件') resultData.State = '4'
        else resultData.State = '2'
        resultData.Traces = oriData.root.track[0].detail.map(item => {
            return {
                AcceptTime: item.time,
                AcceptStation: item.memo,
                Remark: ''
            }
        })
    }
    return resultData
}

const apiCall = async billCode => xml2Json(iconv.decode((await axios.get(`http://tracequery.sto-express.cn/track.aspx?billcode=${billCode}`, { responseType: 'arraybuffer' })).data, 'gb2312'))

const xml2Json = promiseOrCallback(xml2js.parseString)
