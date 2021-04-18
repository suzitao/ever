<template>
    <div>
        <div class="login-container">
            <el-breadcrumb separator="/" class="breadcrumb">
                <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
                <el-breadcrumb-item to="/register">会员注册</el-breadcrumb-item>
            </el-breadcrumb>
            <div style="height: 40px;"></div>
            <div class="login-container-inner">
                <div class="login-form">
                    <div class="login-form-banner">
                        <div class="login-form-banner-right">还没有账号?
                            <router-link to="/register">立即注册</router-link>
                        </div>
                        <div class="login-form-banner-title">会员登录</div>
                    </div>
                    <el-form size="small" :rules="rules" ref="form" status-icon :model="form" label-width="0">
                        <el-form-item prop="username">
                            <el-input placeholder="请输入您的用户名" v-model="form.username" auto-complete="on"></el-input>
                        </el-form-item>
                        <el-form-item prop="password">
                            <el-input placeholder="请输入您的密码" v-model="form.password" :type="dispalyPassword ? 'text' : 'password'"  auto-complete="on" @keyup.enter.native="handleSubmit">
                                <i slot="suffix" class="el-icon-view el-input__icon" @click="dispalyPassword = !dispalyPassword"/>
                            </el-input>
                        </el-form-item>
                        <!-- <el-form-item>
                             <el-row :gutter="20">
                                <el-col :span="15">
                                    <el-input placeholder="请输入验证码" v-model="form.capcha" @keyup.enter.native="handleSubmit"></el-input>
                                </el-col>
                                <el-col :span="9">
                                    <img :src="'/api/capcha?' + t" alt="验证码" @click="refreshCapcha">
                                </el-col>
                            </el-row> 
                            <div ref="captchaBox"></div>
                        </el-form-item> -->
                        <el-form-item style="width:100%;">
                            <el-button :plain="true" type="danger" style="width: 300px" @click="handleSubmit()" :loading="logining" :disabled="!canLogin">立即登录</el-button>
                        </el-form-item>
                    </el-form>
                    <a href="https://kehu.fy-ex.com/" target="_blank" style="line-height: 1.5;">进入旧版系统</a>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { httpGet } from '~/plugins/axios'
import { extend } from '~/plugins/tool'

export default {
    layout: 'index',
    middleware: 'user-login',
    head: {
        title: '会员登录',
        script: [
            { type: 'text/javascript', src: 'https://static.geetest.com/static/tools/gt.js' }
        ]
    },
    data () {
        return {
            dispalyPassword: false,
            t: 1,
            form: {
                username: '',
                password: '',
                capcha: ''
            },
            logining: false,
            canLogin: true,

            rules: {
                username: [{ required: true, message: '请输入用户名', trigger: 'submit' }],
                password: [{ required: true, message: '请输入密码', trigger: 'submit' }]
            },
            captchaObj: null,
            isNeedCaptcha: false
        }
    },
    methods: {
        refreshCapcha () {
            // this.t++
            if (this.captchaObj) {
                this.captchaObj.reset()
            }
        },
        async handleSubmit () {
            this.isNeedCaptcha = await httpGet('/api/users/isNeedCaptcha', { username: this.form.username })
            this.$refs.form.validate((valid) => {
                if (valid) {
                    if (this.isNeedCaptcha) this.captchaObj.verify()
                    else this.doLogin()
                }
            })
        },
        async doLogin () {
            try {
                this.logining = true
                const params = extend({}, this.form)
                const geetestResult = this.captchaObj && this.captchaObj.getValidate()
                if (geetestResult) {
                    extend(params, geetestResult)
                }
                await this.$store.dispatch('login', params)
                if (window.location.hash && window.location.hash.slice(1) && window.location.hash.slice(1, 2) === '/') {
                    this.$router.push(window.location.hash.slice(1))
                } else {
                    this.$router.push('/home/order')
                }
            } catch (e) {
                // this.refreshCapcha()
                this.$message.error(e.message)
            } finally {
                this.logining = false
            }
        },
        async initCap () {
            const data = await httpGet('/api/capcha_register')
            window.initGeetest({
                gt: data.gt,
                challenge: data.challenge,
                offline: !data.success,
                new_captcha: data.new_captcha,
                product: 'bind'
            }, (captchaObj) => {
                this.captchaObj = captchaObj
                captchaObj.onSuccess(() => {
                    this.doLogin()
                })
            })
        }
    },
    mounted () {
        this.initCap()
    }
}
</script>
<style lang="less" scoped>
.login-container {
    padding: 0px 10px;
    width: 1170px - 20px;
    margin: 0 auto;

    .breadcrumb {
        padding: 15px 0;
    } 

    .login-container-inner {
        border: solid 5px #ffffff;
        background-image: url('~/static/image/loginImg.jpg');
        background-size: 100% 100%;
        margin: 0 auto;
        width: 1150px - 10px;
        height: 400px;

        .login-form {
            border: solid 5px #b33131;
            margin-right: 50px;
            margin-top: 75px;
            float: right;
            width: 300px;
            height: 200px;
            padding: 25px 30px;
            background-color: #ffffff;

            .login-form-banner {
                height: 30px;
                line-height: 30px;
                border-bottom: 2px solid #b33131;
                margin-bottom: 15px;

                .login-form-banner-title {
                    font-size: 18px;
                    color: #b33131;
                }

                .login-form-banner-right {
                    font-size: 12px;
                    color: #c3c3c3;
                    float: right;

                    a {
                        color: #61cbff;
                    }
                }
            }
        }
    }
}
</style>
