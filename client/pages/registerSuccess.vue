<template>
    <div>
        <!-- <banner></banner> -->
        <div class="login-container">恭喜你注册成功，<font color="#b33131">{{time}}</font>秒后自动跳转至登录页面
            <nuxt-link :to="'/login'">立即跳转</nuxt-link>
        </div>
    </div>
</template>
<script>
export default {
    layout: 'index',
    head: {
        title: '注册成功'
    },
    data () {
        return {
            time: 5
        }
    },
    mounted () {
        setInterval(() => {
            this.time--
            if (this.time === 0) {
                this.$router.push('/login')
            }
        }, 1000)
    }
}
</script>
<style lang="less" scoped>
.login-container {
    width: 990px;
    margin: 54px auto 0;
    min-height: 300px;
    background-color: white;
    text-align: center;
}
</style>
