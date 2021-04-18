/**
 * Created by jim on 6/24/2017.
 */

import { Router } from 'express'
import { wrap, extendByKey } from '../../tools/util'
import { queryList } from '../../tools/dbutil'

import * as personInfoService from '../../services/personInfo'

import Contacts from '../../models/contacts'

const router = Router()
const filterableKeys = ['contactsType']
const editableKeys = ['contactsType', 'branch', 'name', 'idNumber', 'address', 'cellphoneNumber', 'idCardPositiveImg', 'idCardBackImg', 'isDefault']

router.get('/contacts', wrap(async req => {
    const { pageNo, pageSize, mixSearch } = req.query
    const query = extendByKey({
        creator: req.user._id,
        status: 0
    }, req.query, filterableKeys)
    if (mixSearch) {
        query.$or = [
            { name: new RegExp(mixSearch, 'i') },
            { cellphoneNumber: new RegExp(mixSearch, 'i') }
        ]
    }
    return queryList({
        model: Contacts,
        query,
        sort: { createTime: -1 },
        pageNo: parseInt(pageNo),
        pageSize: parseInt(pageSize)
    })
}))

router.get('/contacts/getDefaultContacts', wrap(async req => {
    return Contacts.find({ isDefault: true, creator: req.user._id })
}))

// 新增
router.post('/contacts', wrap(async req => {
    if (req.body.isDefault) {
        await Contacts.update({ isDefault: true, contactsType: Number(req.body.contactsType), creator: req.user._id }, { $set: { isDefault: false } }).exec()
    }
    personInfoService.updatePersonInfo({
        name: req.body.name,
        cellphoneNumber: req.body.cellphoneNumber,
        idNumber: req.body.idNumber,
        idCardPositiveImg: req.body.idCardPositiveImg,
        idCardBackImg: req.body.idCardBackImg
    }).catch(error => console.log(error))
    console.log(req.body)
    return new Contacts(extendByKey({
        creator: req.user._id
    }, req.body, editableKeys)).save()
}))

// 修改
router.post('/contacts/:id', wrap(async req => {
    const contact = await Contacts.findById(req.params.id).exec()
    if (!contact || contact.status === 2) {
        throw new Error('联系人不存在')
    }
    if (req.body.isDefault) {
        await Contacts.update({ isDefault: true, contactsType: Number(req.body.contactsType), creator: req.user._id }, { $set: { isDefault: false } }).exec()
    }

    personInfoService.updatePersonInfo({
        name: req.body.name,
        cellphoneNumber: req.body.cellphoneNumber,
        idNumber: req.body.idNumber,
        idCardPositiveImg: req.body.idCardPositiveImg,
        idCardBackImg: req.body.idCardBackImg
    }).catch(error => console.log(error))

    extendByKey(contact, req.body, editableKeys)
    return contact.save()
}))

// 删除
router.delete('/contacts/:id', wrap(async req => {
    await Contacts.updateOne({ _id: req.params.id }, { $set: { status: 2 } }).exec()
}))

export default router
