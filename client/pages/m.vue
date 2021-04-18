<template>
<div>
    <nuxt-child></nuxt-child>
    <van-tabbar safe-area-inset-bottom route v-model="activePage">
        <van-tabbar-item v-for="item in barList" :key="item.to" :to="item.to" :icon="item.icon">{{item.name}}</van-tabbar-item>
    </van-tabbar>
</div>
</template>

<script>
import Vue from 'vue'
import Vant from 'vant'
Vue.use(Vant)
export default {
    name: 'M',
    head: {
        meta: [
            { name: 'viewport', content: 'width=device-width, initial-scale=1, user-scalable=no, viewport-fit=cover"' }
        ],
        link: [
            { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/vant@2.5/lib/index.css' }
        ]
    },
    data () {
        return {
            activePage: 'home',
            barList: [
                { to: '/m/home', icon: 'home-o', name: '首页' },
                { to: '/m/search', icon: 'search', name: '运单追踪' },
                { to: '/m/idcard', icon: 'idcard', name: '证件上传' },
                { to: '/m/my', icon: 'contact', name: '个人中心' }
            ]
        }
    }
}
</script>