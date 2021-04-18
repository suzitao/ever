<template>
    <div class="home-container">
    <a href="#top" class="a-locate a-locate-top">返回顶部</a>
    <a href="#bottom" class="a-locate a-locate-bottom">底部</a>
        <div class="home-container">
            <el-breadcrumb separator="/" class="breadcrumb">
                <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
                <el-breadcrumb-item to="/home">我的极速</el-breadcrumb-item>
                <el-breadcrumb-item v-if="childLabel" :to="$route.path">{{childLabel}}</el-breadcrumb-item>
            </el-breadcrumb>

            <div class="home-container-inner">
                <div class="home-menu">
                    <div class="user-info">
                        <img class="avatar" :src="user.avatar"/>
                        <p class="username">{{user.username}}</p>
                    </div>
                    <ul>
                        <nuxt-link tag="li" to="/home/orderEdit?type=ADDNEW">新增运单</nuxt-link>
                        <nuxt-link tag="li" to="/home/order">我的运单</nuxt-link>
                        <nuxt-link tag="li" to="/home/wallet">我的钱包</nuxt-link>
                        <nuxt-link tag="li" to="/home/contacts">常用联系人</nuxt-link>
                        <nuxt-link tag="li" to="/home/commonGoods">常用物品信息</nuxt-link>
                        <nuxt-link tag="li" to="/home/orderImport">批量新增运单</nuxt-link> 
                        <nuxt-link tag="li" to="/home/personalInformation">修改个人信息</nuxt-link>
                    </ul>
                </div>
                <nuxt-child class="home-content" ref="child"></nuxt-child>
            </div>
        </div>
        <a name="bottom"></a>
    </div>
</template>
<script>
import { mapState } from 'vuex'
export default {
    layout: 'index',
    name: 'Home',
    head: {
        title: '个人中心'
    },
    middleware: 'user-authenticated',
    data () {
        return {
            childLabel: ''
        }
    },
    computed: {
        ...mapState(['user'])
    },
    watch: {
        $route () {
            setTimeout(_ => {
                this.getChildLabel()
                if (!this.childLabel) {
                    setTimeout(this.getChildLabel, 200)
                }
            }, 200)
        }
    },
    methods: {
        getChildLabel () {
            this.childLabel = this.$refs.child && this.$refs.child.label
        }
    },
    mounted () {
        this.getChildLabel()
    }
}
</script>
<style lang="less" rel="stylesheet/less">
.home-container {

    .home-container {
        padding: 0px 10px;
        width: 1170px - 20px;
        margin: 0 auto;

        .breadcrumb {
            padding: 15px 0;
        }

        .home-container-inner {
            position: relative;
            min-height: 707px;
            background-color: #ffffff;
            border: solid 1px #eeeeee;

            .home-menu {
                width: 150px;
                border-right: solid 1px #eeeeee;
                position: absolute;
                top: 0;
                bottom: 0;

                .user-info {
                    height: 180px;
                    text-align: center;
                    border-bottom: 1px solid #eeeeee;

                    .avatar {
                        height: 100px;
                        width: 100px;
                        margin-top: 26px;
                        margin-bottom: 10px;
                        border-radius: 50%;
                    }
                }

                li {
                    line-height: 45px;
                    padding-left: 20px;
                    border-left: 3px solid #fff;
                    cursor: pointer;
                    transition: border-color .3s, background-color .3s, color .3s;

                    &:hover {
                        background-color: #f1f3f7;
                        border-left-color: #f1f3f7;
                    }

                    &.active,
                    &.nuxt-link-active {
                        color: #b33131;
                        background-color: #f1f3f7;
                        border-left: 4px solid #48576a;
                    }
                }
            }

            .home-content {
                margin-left: 150px;
                padding: 15px 15px;

                .toolbar-top {
                    min-height: 30px;

                    .left {
                        height: 30px;
                    }

                    .right {
                        float: right;
                        height: 30px;
                    }

                    .left + .left {
                        margin-left: 10px;
                    }

                    .right + .right {
                        margin-right: 10px;
                    }
                }

                .toolbar {
                    background: rgba(218, 218, 218, 0.28);
                    padding: 10px;
                    margin: 10px 0;
                    min-height: 28px;

                    .pager-block {
                        float: right;
                    }

                    .pager-block + .selected {
                        float: right;
                        padding: 2px;
                        font-size: 13px;
                        height: 28px;
                        line-height: 28px;
                        font-weight: 400;
                        color: #606266;
                    }
                }
            }
        }
    }
}
.el-table {
    .cell {
        padding: 0 8px;

        .caret-wrapper {
            margin-left: 0;
        }
    }
}
</style>
