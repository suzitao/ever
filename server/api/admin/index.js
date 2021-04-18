/**
 * Created by jim on 6/24/2017.
 */
import { Router } from 'express'

import branch from './branch'
import Line from './line'
import Order from './order'
import Pallet from './pallet'
import ExpressCompany from './expressCompany'
import User from './user'
import ExchangeRate from './exchangeRate'
import CapitalDetail from './capitalDetail'
import Article from './article'
import Slider from './slider'
import PersonInfo from './personInfo'
import Test from './test'
import PermissionItem from './permissionItem'
import PriceType from './priceType'
import Branch$PriceType from './branch$priceType'
import BranchCustomPrice from './branchCustomPrice'
import UserPriceType from './userPriceType'
import UserBranchCustomPrice from './userBranchCustomPrice'

var router = Router()

router.use(branch)
router.use(Line)
router.use(Order)
router.use(Pallet)
router.use(ExpressCompany)
router.use(User)
router.use(ExchangeRate)
router.use(CapitalDetail)
router.use(Article)
router.use(Slider)
router.use(PersonInfo)
router.use(Test)
router.use(PermissionItem)
router.use(PriceType)
router.use(Branch$PriceType)
router.use(BranchCustomPrice)
router.use(UserPriceType)
router.use(UserBranchCustomPrice)

export default router
