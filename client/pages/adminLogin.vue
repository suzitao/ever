<template>
    <div class="adminLogin-container">
        <div class="banner">
            <div class="logo">
                <div class="logo-1">EVERFAST</div>
                <div class="logo-2">后台管理中心</div>
            </div>
        </div>
        <div class="fotter">
            <div class="copy-right">© 2017 Everfast Express Inc. All rights reserved.</div>
        </div>
        <el-form size="small" :model="editForm" :rules="rules2" ref="editForm" status-icon label-position="left" label-width="0px" class="adminLogin-form">
            <h3 class="title">用户登录</h3>
            <el-form-item prop="username">
                <el-input type="text" v-model="editForm.username" auto-complete="on" placeholder="用户名"></el-input>
            </el-form-item>
            <el-form-item prop="password">
                <el-input placeholder="密码" v-model="editForm.password" :type="dispalyPassword ? 'text' : 'password'"  auto-complete="on" @keyup.enter.native="submit">
                    <i slot="suffix" class="el-icon-view el-input__icon" @click="dispalyPassword = !dispalyPassword"/>
                </el-input>
            </el-form-item>
            <!--<el-checkbox v-model="checked" checked class="remember">记住密码</el-checkbox>-->
            <el-form-item style="width:100%;">
                <el-button type="primary" style="width:100%;" @click.native.prevent="submit" :loading="logining">登录</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>
<script>
export default {
    head: {
        title: 'EVERFAST后台管理中心登录'
    },
    middleware: 'admin-authenticated',
    data () {
        return {
            dispalyPassword: false,
            logining: false,
            editForm: {
                username: '',
                password: ''
            },
            rules2: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'submit' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'submit' }
                ]
            },
            checked: true
        }
    },
    methods: {
        submit (ev) {
            this.$refs.editForm.validate(async (valid) => {
                if (valid) {
                    try {
                        this.logining = true
                        await this.$store.dispatch('login', {
                            username: this.editForm.username,
                            password: this.editForm.password,
                            isAdmin: true
                        })
                        await this.$store.dispatch('admin/getBranchs')
                        if (window.location.hash && window.location.hash.slice(1) && window.location.hash.slice(1, 2) === '/') {
                            this.$router.push(window.location.hash.slice(1))
                        } else {
                            this.$router.push('/admin')
                        }
                    } catch (e) {
                        this.$message.error(e.message)
                    } finally {
                        this.logining = false
                    }
                } else {
                    console.log('error submit!!')
                    return false
                }
            })
        }
    }
}
</script>

<style lang="less" scoped>
.adminLogin-container{
    background-image: url('~/static/image/adminLoginBg.jpg');
    background-color: #ededed;
    background-repeat: no-repeat;
    background-position: 50% 0;
    background-size: cover;
    width: 100%;
    height: 100%;
    min-width: 450px;
    min-height: 360px;
    position: fixed;
    
    .banner {
        position: absolute;
        top: 0;
        width: 100%;
        height: 60px;
        line-height: 60px;
        background-color: #545c64;
        color: #ffffff;

        .logo {
            flex-grow: 0;
            flex-shrink: 0;
            width: 130px;
            height: 36px;
            // font-weight:bold;
            line-height: 18px;
            padding: 12px 10px;
            text-align: center;

            .logo-1 {
                float: left;
                width: 130px;
                font-size: 16px;
                font-weight: bold;
                letter-spacing: 4px;
            }

            .logo-2 {
                float: left;
                width: 130px;
                font-size: 15px;
                letter-spacing: 1px;
            }
        }
    }

    .adminLogin-form {
        position: absolute;
        top: 40%;
        left: 90%;
        border-radius: 5px;
        background-clip: padding-box;
        margin: -45px - 20px 0 0 -380px;
        width: 350px;
        height: 200px;
        padding: 18px 24px 0 24px;
        background: #fff;
        border: 1px solid #eaeaea;
        box-shadow: 0 0 25px #cac6c6;

        .title {
            margin: 15px auto 15px auto;
            color: #505458;
        }

        .remember {
            margin: 0px 0px 35px 0px;
        }
    }

    .fotter {
        position: absolute;
        width: 100%;
        bottom: 0;
        height: 40px;
        background-color: #545c64;
        color: #ffffff;

        .copy-right {
            float: right;
            margin: 15px 20px 0 0;
            font-size: 10px;
        }
    }
}
</style>
