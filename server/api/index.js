import { Router } from 'express'

import users from './users'
import files from './files'
import lines from './lines'
import branchs from './branchs'
import orders from './order'
import user from './user'
import admin from './admin'
import shipmentDetail from './shipmentDetail'
import area from './area'
import article from './article'
import slider from './slider'
import common from './common'

const router = Router()

router.use(users)
router.use(lines)
router.use(branchs)
router.use(orders)
router.use(files)
router.use(shipmentDetail)
router.use(area)
router.use(article)
router.use(slider)
router.use(common)
router.use('/users', (req, res, next) => {
    if (req.user && !req.user.isAdmin) {
        return next()
    }
    next(new Error('User is not sign in'))
}, user)
router.use('/admin', (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        return next()
    }
    console.warn('未授权访问： ', req.originalUrl)
    next(new Error('Admin is not sign in'))
}, admin)

export default router
