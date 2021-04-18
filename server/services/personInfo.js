import { extendByKey } from '../tools/util'
import { PersonInfo } from '../models'

const personInfoAddKeys = ['name', 'cellphoneNumber', 'idNumber', 'idCardPositiveImg', 'idCardBackImg']

// 更新信息库
export async function updatePersonInfo (newPersonInfo) {
    if (newPersonInfo.idNumber && newPersonInfo.idNumber.trim()) {
        const personInfo = await PersonInfo.findOne({name: newPersonInfo.name, cellphoneNumber: newPersonInfo.cellphoneNumber, status: 0})
        if (!personInfo) {
            new PersonInfo(extendByKey({}, newPersonInfo, personInfoAddKeys)).save()
        } else {
            if (personInfo.idNumber !== newPersonInfo.idNumber) {
                personInfo.idNumber = newPersonInfo.idNumber
                personInfo.idCardPositiveImg = newPersonInfo.idCardPositiveImg
                personInfo.idCardBackImg = newPersonInfo.idCardBackImg
                personInfo.save()
            } else if (personInfo.idCardPositiveImg !== newPersonInfo.idCardPositiveImg && personInfo.idCardBackImg !== newPersonInfo.idCardBackImg && newPersonInfo.idCardPositiveImg && newPersonInfo.idCardBackImg) {
                personInfo.idCardPositiveImg = newPersonInfo.idCardPositiveImg
                personInfo.idCardBackImg = newPersonInfo.idCardBackImg
                personInfo.save()
            }
        }
    }
}

// 提取信息
export async function getPersonInfo (name, cellphoneNumber, idNumber) {
    let personInfo
    if (idNumber) {
        personInfo = await PersonInfo.findOne({name, cellphoneNumber, idNumber, status: 0})
    } else {
        personInfo = await PersonInfo.findOne({name, cellphoneNumber, status: 0})
    }
    if (!personInfo) {
        throw new Error(`不存在这个人name:${name},cellphoneNumber:${cellphoneNumber}idNumber:${idNumber}`)
    }
    return personInfo
}
