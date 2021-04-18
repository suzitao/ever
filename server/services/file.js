import path from 'path'
import fs from 'fs-extra'
import JSZip from 'jszip'
import File from '../models/file'
import md5 from '../tools/md5'
import * as awsS3 from '../tools/awsS3'
import userConfig from '../../config'

export const getFileName = (file, def) => {
    let fileName = def || file.originalname
    if (fileName.indexOf('.') === -1) {
        fileName += path.extname(file.originalname) // 补充后缀
    }
    return fileName
}
export const getFilePath = hash => path.join(userConfig.upload.local.dir, hash)

export const uploadFile = async (req, remark) => {
    const { originalname, mimetype, size, buffer } = req.file
    const fileHash = md5(buffer)
    const filePath = getFilePath(fileHash)
    if (!fs.existsSync(filePath)) {
        if (userConfig.upload.type === 'awsS3') await awsS3.upload({ Key: fileHash, Body: buffer, Bucket: userConfig.upload.awsS3.dirBucket })
        else fs.writeFileSync(filePath, buffer)
    }
    return new File({ originalname, mimetype, size, fileHash, creator: req.user && req.user._id, remark }).save()
}

export const batchDl = async (res, fileList) => {
    try {
        const zip = new JSZip()
        for (const f of fileList) {
            const file = await getFile(f.id)
            zip.file(getFileName(file, f.fileName), file.buffer)
        }
        const stream = zip.generateNodeStream({ streamFiles: true })
        stream.on('error', (e) => res.status(404).send(e.message))
        res.attachment('batchDl.zip')
        stream.pipe(res)
    } catch (e) {
        res.status(404).send(e.message)
    }
    // const zip = new JSZip()
    // Promise.all(fileList.map(async f => {
    //     const file = await getFile(f.id)
    //     zip.file(getFileName(file, f.fileName), file.buffer)
    // })).then(async () => {
    //     const stream = zip.generateNodeStream({ streamFiles: true })
    //     stream.on('error', (e) => res.status(404).send(e.message))
    //     res.attachment('batchDl.zip')
    //     stream.pipe(res)
    // }).catch(e => {
    //     res.status(404).send(e.message)
    // })
}

export const getFile = async fileId => {
    const file = await File.findOne({ _id: fileId }).exec()
    if (!file) throw new Error(`File not found ${fileId}`)
    file.buffer = await getFileBuffer(file.fileHash)
    return file
}

export const getFileBuffer = async fileHash => {
    if (userConfig.upload.type === 'awsS3') {
        return awsS3.getObject({ Key: fileHash, Bucket: userConfig.upload.awsS3.dirBucket })
    } else {
        const fpath = getFilePath(fileHash)
        if (!fs.existsSync(fpath)) throw new Error(`File not found fileHash:${fileHash}`)
        return fs.readFileSync(fpath)
    }
}

export const getFileBufferByFileId = async fid => {
    const file = await File.findOne({ _id: fid }).exec()
    if (!file) throw new Error(`File not found id:${fid}`)
    return getFileBuffer(file.fileHash)
}
