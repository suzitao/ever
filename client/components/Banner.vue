<template>
    <div class="home-header">
        <div class="container">
            <router-link class="logo" to="/"><img src="/logo/LOGO5.png" /></router-link>

            <div class="login-box" v-if="user && !user.isAdmin">
                <a href="#" @click="logout">退出登录</a>
                <div style="float:right;margin: 0 5px"> | </div>
                <router-link to="/home/order" style="color:#97a8be;width:130px;">{{user.username}}</router-link>
            </div>
            <div class="login-box" v-else>
                <router-link to="/register">注册</router-link>
                <div style="float:right;margin: 0 5px"> | </div>
                <router-link to="/login">会员登录</router-link>
            </div>

            <el-menu class="el-menu-demo" mode="horizontal" router :default-active="$route.path" :style="{display: $route.path === '/' ? 'none' : 'inline'}" background-color="#fafafa" active-text-color="#b33131">
                <el-menu-item index="/">首页</el-menu-item>
                <el-menu-item index="/orderSearch">运单查询</el-menu-item>
                <el-menu-item index="/news">极速快闻</el-menu-item>
                <el-menu-item index="/product">产品介绍</el-menu-item>
                <el-submenu index="/home">
                    <template slot="title">我的极速</template>
                    <el-menu-item index="/home/orderEdit?type=ADDNEW">我要发货</el-menu-item>
                    <el-menu-item index="/home/order">我的运单</el-menu-item>
                    <el-menu-item index="/home/wallet">我的钱包</el-menu-item>
                    <!-- 下面为隐藏菜单，为了这些页面下菜单高亮 -->
                    <el-menu-item index="/home/orderEdit" style="display:none;"></el-menu-item>
                    <el-menu-item index="/home/contacts" style="display:none;"></el-menu-item>
                    <el-menu-item index="/home/commonGoods" style="display:none;"></el-menu-item>
                    <el-menu-item index="/home/orderImport" style="display:none;"></el-menu-item>
                    <el-menu-item index="/home/personalInformation" style="display:none;"></el-menu-item>
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
</template>
<script>
import { mapState } from 'vuex'

export default {
    computed: {
        ...mapState(['user'])
    },
    methods: {
        async logout () {
            await this.$store.dispatch('logout')
            window.location.reload()
        }
    }
}
</script>

<style lang="less">
    .home-header {
        height: 79px;
        line-height: 79px;
        min-width: 1170px;
        background-color: #fafafa;
        border-bottom: 1px solid #eeeeee;

        .container {
            height: 100%;
        }
        .logo {
            display: inline-block;
            margin: auto 10px;
            height: 100%;
        }

        .el-menu-demo {
            float: right;

            & > .el-menu-item,
            .el-submenu__title {
                height: 79px !important;
                line-height: 79px !important;
            }
        }

        .login-box {
            text-align: right;
            float: right;
            margin-top: 20px;
            margin: 0 10px;
            color: #5d5d5d;
            width: 200px;

            a {
                text-decoration: none;
                color: #5d5d5d;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                float: right;

                &:hover {
                    color: #b33131;
                }
            }
        }
    }
</style>
