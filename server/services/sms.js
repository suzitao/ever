import { System } from '../models'

// import * as rlyun from '../tools/rlyun'
// import * as aliyunSMS from '../tools/aliyunSMS'
import * as ucpaas from '../tools/ucpaas'

async function isSend () {
    const system = await System.findOne({ systemNumber: 'sms01' })
    if (!system || system.value !== true) {
        console.log(system.value)
        throw new Error((system && system.value) || '短信功能关闭')
    }
}

export async function sendIdCardSMS (to, orderNumber) {
    await isSend()
    // return aliyunSMS.sendSMS(to, 'SMS_142954299', { orderNumber }) // 阿里大鱼
    // return rlyun.sendSMS(to, '224118', [orderNumber]) // 容联云
    return ucpaas.sendSMS(to, '370138', [orderNumber]) // 云之讯
}
