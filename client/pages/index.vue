<template>
    <div>
        <el-popover ref="popover1" placement="bottom" width="400" trigger="hover">
            <el-form :model="ruleForm" :rules="rules" ref="ruleForm" status-icon label-width="80px" class="demo-ruleForm">
                <el-form-item label="手机号码" prop="phone">
                    <el-input v-model="ruleForm.name"></el-input>
                </el-form-item>
                <el-form-item label="证件号码" prop="idNumber">
                    <el-input v-model="ruleForm.name"></el-input>
                </el-form-item>
                <div style="text-align: right; margin:0 30px 3px 0">
                    <el-button :plain="true" type="danger" size="small" @click="submitForm('ruleForm')">确定</el-button>
                </div>
            </el-form>
        </el-popover>
    
        <div class="index-slider">
            <el-carousel :interval="5000" arrow="never" height="300px">
                 <el-carousel-item v-for="item in sliderList" :key="item._id">
                    <img :src="`/api/files/${item.img}`" style="object-fit:none;height:100%;width:100%"/>
                </el-carousel-item>
            </el-carousel>
        </div>
        <div class="index-menu">
            <div class="container">
                <div class="input">
                    <el-input v-model="orderNumber" placeholder="请输入运单号" @keyup.enter.native="orderSearch"><el-button slot="append" @click="orderSearch">查询运单</el-button></el-input>
                </div>
                <el-menu :default-active="$route.path" class="el-menu-demo" mode="horizontal" router background-color="#b33131" text-color="#ffffff" active-text-color="#ffffff">
                    <el-menu-item index="/news">极速快闻</el-menu-item>
                    <el-menu-item index="/product">产品介绍</el-menu-item>
                    <el-submenu index="/home">
                        <template slot="title">我的极速</template>
                        <el-menu-item index="/home/orderEdit?type=ADDNEW">我要发货</el-menu-item>
                        <el-menu-item index="/home/order">我的运单</el-menu-item>
                        <el-menu-item index="/home/wallet">我的钱包</el-menu-item>
                    </el-submenu>
                    <el-menu-item index="/idCard">证件上传</el-menu-item>
                    <el-submenu index="/help">
                        <template slot="title">帮助中心</template>
                        <el-menu-item index="/help/branch">网点查询</el-menu-item>
                        <el-menu-item index="/help/faq">常见问题</el-menu-item>
                    </el-submenu>
                </el-menu>
            </div>
        </div>
        <div class="index-body">
            <div class="container">
                <div class="body-flow">
                    <div class="flow-title">寄件流程</div>
                    <div class="flow-container">
                        <el-tabs active-name="first">
                            <el-tab-pane label="注册" name="first"><img src="/image/step/step1.png" /></el-tab-pane>
                            <el-tab-pane label="下单" name="second"><img src="/image/step/step2.png" /></el-tab-pane>
                            <el-tab-pane label="发货" name="third"><img src="/image/step/step3.png" /></el-tab-pane>
                        </el-tabs>
                    </div>
                </div>
                <div class="body-news">
                    <router-link to="/news"><div class="new-title">最新公告</div></router-link>
                    <div class="new-container">
                        <div class="news-item" :key="item._id" v-for="item in newsList"><nuxt-link :to="'/news/' + item._id">{{item.title}}</nuxt-link><time class="time">{{item.createTime | formatTime}}</time></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { httpGet } from '~/plugins/axios'
import { formatDate } from '~/plugins/tool'

export default {
    layout: 'index',
    name: 'Index',
    serverCacheKey () {
        // Will change every 10 secondes
        return Math.floor(Date.now() / 10000)
    },
    head () {
        return {
            title: '首页'
        }
    },
    filters: {
        formatTime: time => formatDate(new Date(time), 'yyyy/MM/dd')
    },
    data () {
        return {
            orderNumber: '',

            ruleForm: {
                phone: '',
                idNumber: ''
            },
            rules: {
                phone: [
                    { required: true, message: '请输入手机号码', trigger: 'blur' }
                ],
                idNumber: [
                    { required: true, message: '请输入证件号码', trigger: 'blur' }
                ]
            },
            newsList: [],
            sliderList: []
        }
    },
    methods: {
        async orderSearch () {
            this.$router.push('/orderSearch/' + this.orderNumber)
        },
        async queryNews () {
            const { list } = await httpGet('/api/article/news', {pageNo: 1, pageSize: 6})
            this.newsList = list
        },
        async querySlider () {
            const { list } = await httpGet('/api/slider', {pageNo: 1, pageSize: 10})
            this.sliderList = list
        },
        async toOld () {
            await this.$confirm('尊敬的顾客您好，极速快递(everfast.ca)现已全面切换至新系统，请各位顾客注册新系统账号使用，历史订单需进入旧版系统查询，点击下方系统可跳转至旧版系统', '公告', {
                confirmButtonText: '跳转至旧版系统',
                cancelButtonText: '关闭'
            })
            window.open('https://kehu.fy-ex.com/')
        }
    },
    mounted () {
        this.querySlider()
        this.queryNews()
        // if (window.sessionStorage && !window.sessionStorage.getItem('index_toold')) {
        //     window.sessionStorage.setItem('index_toold', 1)
        //     this.toOld()
        // }
    }
}
</script>
<style lang="less" rel="stylesheet/less">
.index-header {
    height: 80px;
    line-height: 80px;
    color: #666;
    min-width: 1170px;

    .logo {
        display: inline-block;
        margin: auto 10px;
    }

    .slogan {
        width: 800px;
        float: right;
        font-size: 25px;
        margin: auto 10px;
    }
}

.index-slider {
    min-width: 1170px;
}

.index-menu {
    height: 60px;
    line-height: 60px;
    background-color: #b33131;
    color: #fff;
    min-width: 1170px;

    .input {
        display: inline-block;
        width: 420px;

        .el-input {
            width: 400px;
            margin: auto 10px;

            .el-input__inner {
                border: 0px;
            }
            .el-input-group__append {
                border-left: 1px solid #bdbdbd;
            }
        }
    }

    .el-menu-demo {
        float: right;

        &>.el-menu-item,
        .el-submenu {
            text-align: center;
            border-left: solid 1px #fff;
            width: (1170px - 420px)/5 - 1px;
        }
    }
}

.index-body {
    margin-top: 10px;

    .body-news {
        width: 580px;
        margin-right: 10px;

        .new-title {
            height: 40px;
            line-height: 40px;
            border-bottom: 3px solid #eeeeee;
            text-align: center;
            color: #b33131;
            font-size: 16px;
        }

        .new-container {
            height: 240px;
            border: 1px solid #eeeeee;

            .news-item {
                font-size: 14px;
                margin-top: 20px;
                padding: 0 18px;

                .time {
                    float: right;
                    font-size: 13px;
                    color: #999;
                }
            }
        }
    }

    .body-flow {
        width: 580px;
        float: right;

        .flow-title {
            height: 40px;
            line-height: 40px;
            border-bottom: 3px solid #eeeeee;
            text-align: center;
            color: #b33131;
            font-size: 16px;
        }

        .flow-container {
            height: 240px;
            border: 1px solid #eeeeee;

            .el-tabs__header {
                margin: 0;

                .el-tabs__nav {
                    width: 100%;

                    .el-tabs__item {
                        text-align: center;
                        width: 33.3333%;
                    }
                }
            }
        }
    }
}
</style>
