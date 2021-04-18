import { updateAllTrace } from './order'

const schedule = require('node-schedule')

// export const startSchedule = () => {
//     updateOrderTrace(16, 30, -1)
//     updateOrderTrace(18, 30, 1)
// }

// const updateOrderTrace = async (hour, minute, sort) => {
//     const updateOrderTraceRule = new schedule.RecurrenceRule()
//     updateOrderTraceRule.hour = hour
//     updateOrderTraceRule.minute = minute
//     schedule.scheduleJob(updateOrderTraceRule, async () => {
//         await updateAllTrace(sort)
//     })
// }

export const startSchedule = () => {
    schedule.scheduleJob('0 0,20,40 * * * *', async (fireDate) => {
        await updateAllTrace(fireDate.getHours() % 2 === 1 ? 1 : -1)
    })
}
