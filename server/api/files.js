import { Router } from 'express'
import multer from 'multer'
import { wrap } from '../tools/util'
import { queryList } from '../tools/dbutil'
import File from '../models/file'
import * as fileService from '../services/file'

const router = Router()
// TODO 限制一些不安全的文件
const upload = multer({
    limits: {
        fileSize: 1024 * 1024 * 2 // 2m
    }
})

// 获取文件
router.get('/files/batchDl', async (req, res) => {
    // [{id, fileName}, {id, fileName}]
    const fileList = JSON.parse(req.query.fileList)
    fileService.batchDl(res, fileList)
})

// 获取文件
router.get('/files/:id', async (req, res) => {
    let { fileName } = req.query
    try {
        const file = await fileService.getFile(req.params.id)
        res.set('Content-Type', file.mimetype)
        res.set('Content-Disposition', `attachment; filename=${encodeURIComponent(fileService.getFileName(file, fileName))}`)
        res.end(file.buffer)
    } catch (e) {
        res.status(404).send(e.message)
    }
})

// 删除文件
router.get('/files/delete/:id', async (req, res) => {
    // TODO:删除文件接口
})

// 上传文件
router.post('/files', upload.single('file'), wrap(async req => {
    if (!req.file) throw new Error('文件不存在')
    return fileService.uploadFile(req)
}))

// ueditor
router.use('/ueditor', async (req, res, next) => {
    switch (req.query.action) {
    case 'config':
        res.json(require('../constant/ueditor.config').default)
        break
    case 'uploadimage':
    case 'uploadfile':
    case 'uploadvideo':
        upload.single('upfile')(req, res, async err => {
            if (err) {
                console.error(err)
                return
            }

            const file = await fileService.uploadFile(req, 'ueditor')

            res.json({
                'state': 'SUCCESS',
                'url': `/api/files/${file.id}`,
                'title': file.originalname,
                'original': file.originalname
            })
        })
        break
    case 'listimage':
        const { start, size } = req.query
        const { total, list } = await queryList({
            model: File,
            sort: { createTime: -1 },
            query: {
                status: 0,
                remark: 'ueditor'
            },
            pageNo: parseInt(start) + 1,
            pageSize: parseInt(size)
        })
        res.json({
            state: 'SUCCESS',
            list: list.map(file => ({
                id: file.id,
                url: `/api/files/${file.id}`,
                title: file.originalname,
                original: file.originalname
            })),
            start,
            total
        })
        break
    case 'catchimage':
        res.json({
            state: '暂不支持'
        })
        break
    default:
        res.status(404).send('ERROR')
    }
})

export default router
