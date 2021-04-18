/**
 * Created by jim on 6/21/2017.
 */
import path from 'path'

export default {
    db: {
        uri: 'mongodb://XXXXXX',
        options: { useNewUrlParser: true }
    },
    redis: {
        host: '127.0.0.1',
        port: 6379,
        password: 'kingdee',
        prefix: 'everfast_test-'
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
        prefix: 'everfast-test:'
    },
    kdniao: {
        EBusinessID: '1299336',
        AppKey: 'XXXXXX',
        ReqURL: 'http://api.kdniao.com/api/dist'
    }
}
