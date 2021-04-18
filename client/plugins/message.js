import Vue from 'vue'
import { Message } from 'element-ui'

const types = [
    'success',
    'warning',
    'info',
    'error'
]

Vue.prototype.$message = function (options) {
    if (typeof options === 'string') {
        Message({
            showClose: true,
            message: options
        })
    } else {
        Message({
            showClose: options.showClose === undefined ? true : options.showClose,
            message: options
        })
    }
}

types.forEach(type => {
    Vue.prototype.$message[type] = function (options) {
        if (typeof options === 'string') {
            Message({
                showClose: true,
                type,
                message: options
            })
        } else {
            Message({
                showClose: options.showClose === undefined ? true : options.showClose,
                type,
                message: options
            })
        }
    }
})

Vue.prototype.$message.close = Message.close
Vue.prototype.$message.closeAll = Message.closeAll
