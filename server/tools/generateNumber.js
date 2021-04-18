// import moment from 'moment'
import client from './redis'
import { formatNum } from './util'
/**
 * 订单号生成
 * @export
 */
export default async function (index, object, numberCol, isRecordTime) {
    const checkParams = {}
    while (true) {
        const newNumber = await getNewNumber(index, isRecordTime)
        checkParams[numberCol] = newNumber
        const result = await object.findOne(checkParams)
        if (!result) {
            return newNumber
        }
    }
}

const getNewNumber = async (index, isRecordTime) => {
    index = String(index)
    const date = new Date()
    if (isRecordTime) {
        const dateStr = String(+date).substr(1, 4)
        index = index + dateStr
    }
    const num = await client.incrAsync(`orderIdInc_${index}`)
    return `${index}${formatNum(num, '0', 4)}`
}
