
import uuid from 'uuid'
import crypto from 'crypto'

const ReqURL = 'https://dm.aliyuncs.com/'

const accessKeyID = 'LTAIlIRcY1yPOoMH'
const accessKeySecret = 'sSn5S0deA65K8FeCa48YWCeSoTAHij'

const paramsKey = [
    `AccessKeyId`,
    `AccountName`,
    `Action=SingleSendMail`,
    `AddressType`,
    `Format`,
    `RegionId`,
    `ReplyToAddress`,
    `SignatureMethod`,
    `SignatureNonce`,
    `SignatureVersion`,
    `Subject`,
    `TextBody`,
    `Timestamp`,
    `ToAddress`,
    `Version`
]

const _escape = (str) => {
    // str = str.toString()
    // str = encodeURIComponent(str)
    //     .replace(/\!/gi, '%21')
    //     .replace(/\'/gi, '%27')
    //     .replace(/\(/gi, '%28')
    //     .replace(/\)/gi, '%29')
    //     .replace(/\*/gi, '%2A')
    // return str
    return encodeURIComponent(str).replace(/\*/g, '%2A')
}

const getSignature = stringToSign => {
    let signature = crypto.createHmac('sha1', `${accessKeySecret}&`)
    signature = signature.update(new Buffer(stringToSign, 'utf8')).digest('base64')
    return signature
}

export async function test ({AccountName, ToAddress, Subject, TextBody}) {

    const params = {
        AccessKeyId: accessKeyID,
        AccountName: AccountName,
        Action: 'SingleSendMail',
        AddressType: 1,
        Format: 'JSON',
        RegionId: 'cn-hangzhou',
        ReplyToAddress: true,
        SignatureMethod: 'HMAC-SHA1',
        SignatureNonce: uuid.v4(),
        SignatureVersion: 1.0,
        Subject: Subject,
        TextBody: TextBody,
        Timestamp: new Date().toISOString(),
        ToAddress: ToAddress,
        Version: '2015-11-23'
    }

    const canonicalizedQueryString = paramsKey.sort().map(key => {
        return _escape(key) + '=' + _escape(params[key])
    }).join('&')
    console.log('canonicalizedQueryString:', canonicalizedQueryString)

    const stringToSign = `GET&%2F&` + _escape(canonicalizedQueryString)
    console.log('stringToSign:', stringToSign)

    const signature = getSignature(stringToSign)
    console.log('signatured:', signature)

    const url = ReqURL + '?signature=' + signature + '&' + canonicalizedQueryString
    console.log('url:', url)

    return {canonicalizedQueryString, stringToSign, signature, url}
}
