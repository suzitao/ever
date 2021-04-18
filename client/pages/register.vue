<template>
    <div>
    
        <div class="login-container">
            <!-- <div class="login-banner"></div> -->
            <el-breadcrumb separator="/" class="breadcrumb">
                <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
                <el-breadcrumb-item to="/register">会员注册</el-breadcrumb-item>
            </el-breadcrumb>
    
            <div class="login-container-inner">
                <div class="login-form">
                    <el-form :rules="rules" ref="editForm" status-icon :model="editForm" label-width="80px">
                        <el-form-item label="用户名" prop="username">
                            <el-input v-model="editForm.username"></el-input>
                        </el-form-item>
                        <el-form-item label="真实姓名" prop="realname">
                            <el-input v-model="editForm.realname"></el-input>
                        </el-form-item>
                        <el-form-item label="手机号码" prop="cellphoneNumber">
                            <el-input v-model="editForm.cellphoneNumber"></el-input>
                        </el-form-item>
                        <el-form-item label="E-mail" prop="email">
                            <el-input v-model="editForm.email" type="email"></el-input>
                        </el-form-item>
                        <el-form-item label="密码" prop="password">
                            <el-input v-model="editForm.password" type="password"></el-input>
                        </el-form-item>
                        <el-form-item label="确认密码" prop="repassword">
                            <el-input v-model="editForm.repassword" type="password"></el-input>
                        </el-form-item>
                        <el-button type="danger" style="margin-left: 80px; width: 420px" @click="handleSubmit" :loading="logining">立即注册</el-button>
                    </el-form>
                </div>
                <div class="login-form-right">
                    <div class="item-title">注册成为极速会员，您可以享受更多的服务！</div>
                    <li class="item">网上自助下单，快件信息管理</li>
                    <li class="item">会员专享福利</li>
                    <li class="item">及时获取最新咨询</li>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { httpGet } from '~/plugins/axios'
import { formatCanadaCellphoneNumber, validatePhoneNumber } from '~/plugins/tool'

export default {
    layout: 'index',
    middleware: 'user-login',
    head: {
        title: '会员注册'
    },
    data () {
        return {
            editForm: {
                username: '',
                password: '',
                realname: '',
                email: '',
                repassword: '',
                cellphoneNumber: ''
            },
            logining: false,

            rules: {
                username: [
                    {
                        validator: async (rule, value, callback) => {
                            const exp1 = /^[a-zA-Z]{1}[0-9A-Za-z]{5,19}$/
                            if (!value) {
                                callback()
                            } else if (!exp1.test(value)) {
                                callback(new Error('用户名由字母和数字组成，必须以字母开头，长度6-20位，不可包含特殊字符'))
                            } else if (await httpGet(`/api/users/isExist/username?username=${value}`)) {
                                callback(new Error('用户名已存在'))
                            } else {
                                callback()
                            }
                        },
                        trigger: 'blur'
                    },
                    { required: true, message: '请输入用户名', trigger: 'submit' }
                ],
                password: [
                    {
                        validator: (rule, value, callback) => {
                            const exp1 = /^[0-9]+$/
                            const exp2 = /^[A-Z]+$/
                            const exp3 = /^[a-z]+$/
                            const exp4 = /^[0-9A-Za-z]{8,20}$/
                            if (!value) {
                                callback()
                            } else if ((exp1.test(value)) || (exp2.test(value)) || (exp3.test(value)) || !(exp4.test(value))) {
                                callback(new Error('密码必须由数字/大写字母/小写字母三种中的两种组成，长度8-20位'))
                            } else {
                                callback()
                            }
                        },
                        trigger: 'blur'
                    },
                    { required: true, message: '请输入密码', trigger: 'submit' }
                ],
                realname: [
                    { required: true, message: '请输入真实姓名', trigger: 'submit' }
                ],
                email: [
                    { type: 'email', message: 'E-mail格式不正确', trigger: 'blur' },
                    {
                        validator: async (rule, value, callback) => {
                            const exp = /^(\w)+(\.\w+)*@(\w)+((\.\w{2,3}){1,3})$/
                            if (!value) {
                                callback()
                            } else if (!exp.test(value)) {
                                callback(new Error('E-mail格式不正确'))
                            } else if (await httpGet(`/api/users/isExist/email?email${value}`)) {
                                callback(new Error('E-mail已经绑定其他账号'))
                            } else {
                                callback()
                            }
                        },
                        trigger: 'blur'
                    },
                    { required: true, message: '请输入E-mail', trigger: 'submit' }
                ],
                cellphoneNumber: [
                    {
                        validator: async (rule, value, callback) => {
                            this.editForm.cellphoneNumber = formatCanadaCellphoneNumber(this.editForm.cellphoneNumber)
                            if (await httpGet(`/api/users/isExist/cellphoneNumber?cellphoneNumber=${this.editForm.cellphoneNumber}`)) {
                                callback(new Error('手机号码已经绑定其他账号'))
                            }
                            callback(validatePhoneNumber(this.editForm.cellphoneNumber, 'canada', '加拿大'))
                        },
                        trigger: 'blur'
                    },
                    { required: true, message: '请输入手机号码', trigger: 'submit' }
                ],
                repassword: [
                    {
                        validator: (rule, value, callback) => {
                            if (!value) {
                                callback()
                            } else if (value !== this.editForm.password) {
                                callback(new Error('两次密码不一致'))
                            } else {
                                callback()
                            }
                        },
                        trigger: 'blur'
                    },
                    { required: true, message: '请输入确认密码', trigger: 'submit' }
                ]
            }
        }
    },
    methods: {
        handleSubmit () {
            this.$refs.editForm.validate((valid) => {
                if (valid) {
                    this.doLogin()
                }
            })
        },
        async doLogin () {
            try {
                this.logining = true
                await this.$store.dispatch('register', this.editForm)
            } catch (e) {
                this.$message.error(e.message)
            } finally {
                this.logining = false
                this.$router.push('/registerSuccess')
            }
        }
    }
}
</script>
<style lang="less" scoped>
.login-container {
    padding: 0px 10px;
    width: 1170px - 20px;
    margin: 0 auto; // .login-banner {
    //     float: left;
    //     width: 543px;
    //     height: 282px;
    //     overflow: hidden;
    //     padding: 58px 0 0 65px;
    // }
    .breadcrumb {
        padding: 15px 0;
    }

    .login-container-inner {
        // padding: 15px 15px;
        position: relative;
        min-height: 500px;
        background-color: #ffffff;

        .login-form {
            padding: 50px 150px 50px 50px;
            width: 500px;
            border-right: solid 1px #eeeeee;
            position: absolute;
            top: 0;
            bottom: 0;
        }

        .login-form-right {

            margin-left: 700px;
            padding: 50px 50px 0 100px;

            .item-title {
                color: #5d5d5d;
            }

            .item {
                padding-top: 50px;
                color: #d00000;
            }
        }
    }
}
</style>
