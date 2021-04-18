
import { Router } from 'express'
import { wrap } from '../../tools/util'
import PermissionItem from '../../models/permissionItem'

const router = Router()

router.get('/permissionItem/getAllPermissionItem', wrap((req, res) => {
    return PermissionItem.find({status: 0}).sort({ permissionItemNumber: 1 })
}))

export default router
