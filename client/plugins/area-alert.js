import Vue from 'vue'
import AreaAlertDialog from '~/components/dialog/AreaAlertDialog'

const Constructor = Vue.extend(AreaAlertDialog)

Vue.prototype.$areaAlert = function (options) {
    if (Vue.prototype.$isServer) return

    const instance = new Constructor({})
    const vm = instance.$mount()
    document.body.appendChild(vm.$el)
    if (options.key || options.value || options.title) {
        if (options.key) vm.key = options.key
        if (options.value) vm.value = options.value
        if (options.title) vm.title = options.title
        vm.alert(options.data)
    } else {
        vm.alert(options)
    }
    vm.$once('close', _ => {
        const el = vm.$el
        vm.$destroy()
        el.remove()
    })
}
