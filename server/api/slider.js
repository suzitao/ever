
import { Router } from 'express'
import { wrap } from '../tools/util'
import { queryList } from '../tools/dbutil'
import Slider from '../models/slider'

const router = Router()

router.get('/slider', wrap(async (req, res) => {
    const { pageNo, pageSize } = req.query
    const query = { status: 0 }
    return queryList({
        model: Slider,
        query,
        sort: { sliderNumber: 1 },
        pageNo: parseInt(pageNo),
        pageSize: parseInt(pageSize)
    })
}))

export default router
