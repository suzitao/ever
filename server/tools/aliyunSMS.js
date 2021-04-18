/**
 * 阿里大鱼SMS接口
 * @author zitao_su
 */
const SMSClient = require('@alicloud/sms-sdk')

const accessKeyId = 'XXXXXX'
const secretAccessKey = 'XXXXXX'

// 初始化sms_client
const smsClient = new SMSClient({accessKeyId, secretAccessKey})

export function sendSMS (to, templateId, datas) {
    return smsClient.sendSMS({
        PhoneNumbers: to.join(','), // 必填:待发送手机号。支持以逗号分隔的形式进行批量调用，批量上限为1000个手机号码,批量调用相对于单条调用及时性稍有延迟,验证码类型的短信推荐使用单条调用的方式；发送国际/港澳台消息时，接收号码格式为00+国际区号+号码，如“0085200000000”
        SignName: '极速快递', // 必填:短信签名-可在短信控制台中找到
        TemplateCode: templateId, // 必填:短信模板-可在短信控制台中找到，发送国际/港澳台消息时，请使用国际/港澳台短信模版
        TemplateParam: JSON.stringify(datas) // 可选:模板中的变量替换JSON串,如模板内容为"亲爱的${name},您的验证码为${code}"时。
    }).then(res => {
        console.log(JSON.stringify(res))
        if (res.Code === 'OK') return res
        else throw new Error(res.Message)
    }).catch(err => { throw err })
}
