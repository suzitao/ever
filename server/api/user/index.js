import { Router } from 'express'

import Order from './order'
import Contacts from './contacts'
import CommonGoods from './commonGoods'
import CapitalDetail from './capitalDetail'
import User from './user'

var router = Router()

router.use(Order)
router.use(Contacts)
router.use(CommonGoods)
router.use(CapitalDetail)
router.use(User)
export default router
