<template>
<div>
    <banner></banner>
    <van-swipe :autoplay="3000" height="200">
        <van-swipe-item v-for="item in sliderList" :key="item._id">
            <img v-lazy="`/api/files/${item.img}`" style="object-fit:cover;height:100%;width:100%"/>
        </van-swipe-item>
    </van-swipe>
    <van-search label="运单追踪" show-action v-model="orderNumber" @search="orderSearch" placeholder="请输入运单号查询">
        <div slot="action" @click="orderSearch">查询</div>
    </van-search>
    <van-panel title="最新公告">
        <div class="news-item" :key="item._id" v-for="item in newsList">
            <nuxt-link class="title" :to="'/news/' + item._id">{{item.title}}</nuxt-link>
            <time class="time">{{item.createTime | formatTime}}</time>
        </div>
    </van-panel>
</div>

</template>

<script>
import Vue from 'vue'
import { Lazyload } from 'vant'
import { httpGet } from '~/plugins/axios'
import { formatDate } from '~/plugins/tool'
import Banner from '~/components/mobile/MobileBanner'
Vue.use(Lazyload)
export default {
    components: { Banner },
    async asyncData ({ params, error }) {
        try {
            const newsData = await httpGet('/api/article/news', {pageNo: 1, pageSize: 6})
            const sliderData = await httpGet('/api/slider', { pageNo: 1, pageSize: 10 })
            return {
                newsList: newsData.list,
                sliderList: sliderData.list
            }
        } catch (e) {
            console.error(e.message)
        }
    },
    data () {
        return {
            orderNumber: ''
        }
    },
    filters: {
        formatTime: time => formatDate(new Date(time), 'yyyy/MM/dd')
    },
    methods: {
        orderSearch () {
            this.$router.push('/m/search?orderNumber=' + this.orderNumber)
        }
    }
}
</script>

<style lang="less" scoped>
.news-item {
    font-size: 14px;
    margin-top: 20px;
    padding: 0 18px;

    .title {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        width: 200px;
        display: inline-block;
    }

    .time {
        float: right;
        font-size: 13px;
        color: #999;
    }
}
</style>