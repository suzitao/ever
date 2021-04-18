/**
 * Created by jim on 6/21/2017.
 */
import path from 'path'

export default {
    db: {
        // 测试库
        uri: 'mongodb://XXXXXX',
        options: { useNewUrlParser: true }
    },
    redis: {
        host: '47.107.64.212',
        port: 6379,
        password: 'XXXXXX',
        prefix: 'everfast_dev-'
    },
    upload: {
        type: 'local',
        awsS3: {
            tmpBucket: 'everfast-test-temp',
            dirBucket: 'everfast-test'
        },
        local: {
            tmp: path.join(process.cwd(), '.temp'),
            dir: path.join(process.cwd(), '.upload')
        }
    },
    session: {
        secret: 'XXXXXX',
        prefix: 'everfast-dev:'
    },
    kdniao: {
        EBusinessID: '1299336',
        AppKey: 'XXXXXX',
        ReqURL: 'http://api.kdniao.com/api/dist'
    },
    zto: {
        platFormSource: 10661,
        warehouseCode: 'au002',
        secretKey: 'XXXXXX',
        appCode: '10661',
        ReqURL: 'https://izop-test.zt-express.com/oms/api'
    }
}
