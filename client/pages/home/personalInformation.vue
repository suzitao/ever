<template>
    <div class="home-personal-information">
        <div class="information-form">
            <el-form :rules="rules" ref="editForm" :model="editForm" label-width="80px">
                <el-form-item label="手机号码" prop="cellphoneNumber">
                    <el-input v-model="editForm.cellphoneNumber"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email" type="email"></el-input>
                </el-form-item>
                <el-button :plain="true" type="danger" style="margin-left: 80px; width: 420px" @click="submit" :loading="editForm.logining">确认修改</el-button>
            </el-form>
        </div>
        <div class="password-form">
            <el-button :plain="true" type="danger" style="margin-left: 80px; width: 420px" @click="handlePasswordEdit">修改密码</el-button>
        </div>
        <el-dialog title="修改密码" :visible.sync="passwordEditForm.dialogVisible" :before-close="handlePasswordClose">
            <el-form :model="passwordEditForm" :rules="passwordRules" ref="passwordEditForm" status-icon label-width="120px">
                <el-form-item label="当前密码" prop="password">
                    <el-input type="password" v-model="passwordEditForm.password"></el-input>
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword">
                    <el-input type="password" v-model="passwordEditForm.newPassword"></el-input>
                </el-form-item>
                <el-form-item label="确认新密码" prop="newPasswordCopy">
                    <el-input type="password" v-model="passwordEditForm.newPasswordCopy"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="passwordSubmit" :loading="passwordEditForm.loading">提交</el-button>
                <el-button @click="handlePasswordClose">取消</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<style lang="less">
.home-personal-information {

    .information-form {
        padding: 20px;
        border: solid 1px #eeeeee;
    }

    .password-form {
        padding: 20px;
        border: solid 1px #eeeeee;
        margin-top: 20px;
    }
}
</style>
<script>
import { httpPost, httpGet } from '~/plugins/axios'
import { mapState } from 'vuex'
import { formatCanadaCellphoneNumber, validatePhoneNumber } from '~/plugins/tool'

export default {
    data () {
        return {
            label: '修改个人信息',
            editForm: {
                cellphoneNumber: '',
                email: '',
                logining: false
            },
            passwordEditForm: {
                password: '',
                newPassword: '',
                newPasswordCopy: '',

                loading: false,
                dialogVisible: false
            },
            rules: {
                email: [
                    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
                    { required: true, message: '请输入邮箱', trigger: 'submit' }
                ],
                cellphoneNumber: [
                    {
                        validator: async (rule, value, callback) => {
                            this.editForm.cellphoneNumber = formatCanadaCellphoneNumber(this.editForm.cellphoneNumber)
                            if (await httpGet(`/api/users/isExist/cellphoneNumber?cellphoneNumber=${this.editForm.cellphoneNumber}&id=${this.user._id}`)) {
                                callback(new Error('手机号码已经绑定其他账号'))
                            }
                            callback(validatePhoneNumber(this.editForm.cellphoneNumber, 'canada', '加拿大'))
                        },
                        trigger: 'blur'
                    },
                    { required: true, message: '请输入手机号码', trigger: 'submit' }
                ]
            },
            passwordRules: {
                password: [
                    { required: true, message: '请输入当前密码', trigger: 'submit' }
                ],
                newPassword: [
                    { required: true, message: '请输入新密码', trigger: 'submit' }
                ],
                newPasswordCopy: [
                    {
                        validator: (rule, value, callback) => {
                            if (!value) {
                                callback()
                            } else if (value !== this.passwordEditForm.newPassword) {
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
    computed: {
        ...mapState(['user'])
    },
    methods: {
        submit () {
            this.$refs.editForm.validate(async (valid) => {
                if (valid) {
                    try {
                        this.editForm.loading = true
                        await this.$store.dispatch('personalInformation', this.editForm)
                        this.$message.success('操作成功')
                    } catch (e) {
                        this.$message.error(e.message)
                        this.editForm.loading = false
                    } finally {

                    }
                }
            })
        },
        handlePasswordEdit () {
            this.passwordEditForm.dialogVisible = true
        },
        handlePasswordClose () {
            this.passwordEditForm = {
                password: '',
                newPassword: '',
                newPasswordCopy: '',

                loading: false,
                dialogVisible: false
            }
        },
        passwordSubmit () {
            this.$refs.passwordEditForm.validate(async (valid) => {
                if (valid) {
                    try {
                        this.passwordEditForm.loading = true
                        await httpPost(`/api/users/password`, this.passwordEditForm)
                        this.handlePasswordClose()
                        this.$message.success('操作成功')
                    } catch (e) {
                        this.$message.error(e.message)
                        this.passwordEditForm.loading = false
                    } finally {

                    }
                }
            })
        }
    },
    mounted () {
        this.editForm = {
            cellphoneNumber: this.user.cellphoneNumber,
            email: this.user.email,

            loading: false
        }
    }
}
</script>
