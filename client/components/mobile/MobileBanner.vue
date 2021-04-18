<template>
    <div class="mobile-banner">
        <router-link class="logo" to="/">
            <img src="/logo/LOGO5.png" />
        </router-link>
        <div class="login-box" v-if="user && !user.isAdmin">
            <a href="#" @click="logout">退出</a>
            <div style="float:right;margin: 0 5px"> | </div>
            <router-link to="/home/order" style="color:#97a8be;width:100px;">{{user.username}}</router-link>
        </div>
        <div class="login-box" v-else>
            <router-link to="/register">注册</router-link>
            <div style="float:right;margin: 0 5px"> | </div>
            <router-link to="/login">会员登录</router-link>
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
    .mobile-banner {
        height: 60px;
        line-height: 60px;

        .logo {
            display: inline-block;
            margin: auto 10px;
            height: 100%;

            img {
                height: 55px;
            }
        }

        .login-box {
            text-align: right;
            float: right;
            margin-top: 20px;
            margin: 0 10px;
            color: #5d5d5d;
            width: 150px;

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
