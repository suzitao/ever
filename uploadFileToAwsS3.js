const AWS = require('aws-sdk')
const path = require('path')
const fs = require('fs-extra')
const accessKeyId = 'XXXXXX'
const secretAccessKey = 'XXXXXX'
const credentials = new AWS.Credentials({ accessKeyId, secretAccessKey })
AWS.config.update({ region: 'us-east-1', credentials })
const s3 = new AWS.S3()

if (!process.argv[2]) throw new Error('please enter BUCKET_NAME')
if (process.argv[3] === undefined) throw new Error('please enter if delete old object in bucket')

const bucketName = process.argv[2]
const deleteOldObject = process.argv[3]

if (deleteOldObject !== 'false' && `delete-${bucketName}` !== deleteOldObject) throw new Error('please enter delete-[bucketName] in the second arg')

const getFilePath = filehash => path.join(process.cwd(), '.upload', filehash)

const promiseOrCallback = (fn, ctx, modifyRes) => {
    return function () {
        const context = ctx || this
        const args = Array.prototype.slice.apply(arguments)
        // 判断调用函数时实际传过来的参数数量
        if (typeof args[args.length - 1] === 'function') {
            // 这是callback方式调用的
            return fn.apply(context, args)
        }
        // 这是promise方式调用的
        return new Promise((resolve, reject) => {
            // 创建一个callback函数用来对接promise的resolve和reject
            args.push((err, ret) => {
                err ? reject(err) : resolve(modifyRes ? modifyRes(ret) : ret)
            })
            fn.apply(context, args)
        })
    }
}

const upload = promiseOrCallback(s3.upload, s3)
const listObjects = promiseOrCallback(s3.listObjects, s3)
const deleteObjects = promiseOrCallback(s3.deleteObjects, s3)

let deleted = 0
const doDelete = async () => {
    const data = await listObjects({ Bucket: bucketName, MaxKeys: 100 })
    if (data.Contents.length > 0) {
        const Objects = data.Contents.map(obj => {
            return { Key: obj.Key }
        })
        await deleteObjects({
            Bucket: bucketName,
            Delete: { Objects }
        })
        deleted = deleted + Objects.length
        console.log(`deleted ${deleted}`)
        await doDelete()
    } else {
        console.log('completed delete', `total deleted ${deleted}`)
    }
}

const doUpload = async () => {
    if (`delete-${bucketName}` === deleteOldObject) {
        await doDelete()
    }
    const fileArray = fs.readdirSync(getFilePath(''))
    let success = 0
    let fail = 0
    for (let filehash of fileArray) {
        try {
            const buffer = fs.readFileSync(getFilePath(filehash))
            await upload({
                Bucket: bucketName,
                Key: filehash,
                Body: buffer
            })
            console.log(`success upload file ${filehash}`, `success: ${++success}`, `fail: ${fail}`)
        } catch (e) {
            console.log(`fail upload file ${filehash}, ${e.message}`, `success: ${success}`, `fail: ${++fail}`)
        }
    }
}

doUpload()
