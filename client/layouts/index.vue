<template>
    <div>
        <banner></banner>
        <div :style="{ minHeight: minHeight + 'px' }"><nuxt/></div>
        <buttom v-if="minHeight"></buttom>
    </div>
</template>

<script>
import Banner from '~/components/Banner'
import Buttom from '~/components/Buttom'

export default {
    components: { Banner, Buttom },
    head: {
    },
    data () {
        return {
            minHeight: 0
        }
    },
    mounted () {
        this.minHeight = document.documentElement.clientHeight - 170
        window.addEventListener('resize', () => {
            this.minHeight = document.documentElement.clientHeight - 170
        })
    }
}
</script>

<style lang="less">
.el-tabs__active-bar {
    background-color: #b33131;
}
.el-tabs__item.is-active {
    color: #b33131;
}
.el-tabs__item:hover {
    color: #b33131;
}
</style>


