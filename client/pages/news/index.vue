<template>
    <div class="news-container">
        <div class="news-container">
            <el-breadcrumb separator="/" class="breadcrumb">
                <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
                <el-breadcrumb-item to="/news">极速快闻</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="news-container-inner">
                <el-card :body-style="{ padding: '0px' }" :key="item._id" v-for="item in list">
                    <img :src="item.headImg ?　`/api/files/${item.headImg}` : '/logo/LOGO6.jpg'" class="image"/>
                    <div style="padding: 14px;">
                        <span>{{item.title}}</span>
                        <div class="bottom clearfix">
                            <time class="time">{{item.createTime | formatTime}}</time>
                            <nuxt-link class='button' :to="'/news/' + item._id">查看详情</nuxt-link>
                        </div>
                    </div>
                </el-card>
            </div>
        </div>
    </div>
</template>

<style lang="less" rel="stylesheet/less">
.news-container {
    .news-container {
        padding: 0px 10px;
        width: 1170px - 20px;
        margin: 0 auto;

        .breadcrumb {
            padding: 15px 0;
        }

        .news-container-inner {
            padding: 15px 15px;
            position: relative;
            min-height: 300px;
            border: solid 1px #eeeeee;

            .el-card{
                margin-bottom: 15px;

                .time {
                    font-size: 13px;
                    color: #999;
                }

                .bottom {
                    margin-top: 13px;
                    line-height: 12px;
                }

                .button {
                    padding: 0;
                    float: right;
                }

                .image {
                    width: 100%;
                    height: 80px;
                    display: block;
                }

                .clearfix:before,
                .clearfix:after {
                    display: table;
                    content: "";
                }

                .clearfix:after {
                    clear: both
                }
            }
        }
    }
}
</style>

<script>
import { httpGet } from '~/plugins/axios'
import { formatDate } from '~/plugins/tool'

export default {
    layout: 'index',
    name: 'News',
    head: {
        title: '极速快闻'
    },
    filters: {
        formatTime: time => formatDate(new Date(time), 'yyyy/MM/dd')
    },
    data () {
        return {
            list: []
        }
    },
    async mounted () {
        const { list } = await httpGet('/api/article/news')
        this.list = list
    }
}
</script>
