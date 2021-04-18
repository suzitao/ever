import path from 'path'

export default {
    db: {
        // monggodb atlas正式库
        uri: 'mongodb+srv://XXXXXX',
        options: { useNewUrlParser: true }
    },
    redis: {
        host: '127.0.0.1',
        port: 6379,
        password: 'XXXXXX',
        prefix: 'everfast_pro-'
    },
    upload: {
        type: 'awsS3',
        awsS3: {
            tmpBucket: 'everfast-pro-temp',
            dirBucket: 'everfast-pro'
        },
        local: {
            tmp: path.join(process.cwd(), '.temp'),
            dir: path.join(process.cwd(), '.upload')
        }
    },
    session: {
        secret: 'XXXXXX',
        prefix: 'everfast-pro:'
    },
    kdniao: {
        EBusinessID: '1299336',
        AppKey: 'XXXXXX',
        ReqURL: 'http://api.kdniao.com/api/dist'
    }
}
