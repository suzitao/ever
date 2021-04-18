<template>
    <el-dialog title="修改密码" :visible.sync="dialogVisible" :before-close="handleClose" width="650px">
        <el-form size="small" :model="editForm" :rules="editFormRules" ref="editForm" status-icon label-width="120px">
            <el-form-item label="当前密码" prop="password">
                <el-input type="password" v-model="editForm.password"></el-input>
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
                <el-input type="password" v-model="editForm.newPassword"></el-input>
            </el-form-item>
            <el-form-item label="确认新密码" prop="newPasswordCopy">
                <el-input type="password" v-model="editForm.newPasswordCopy"></el-input>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button size="small" type="primary" @click="handleSubmit" :loading="loading">提交</el-button>
            <el-button size="small" @click="handleClose">取消</el-button>
        </div>
    </el-dialog>
</template>
<script>
import { httpPost } from '~/plugins/axios'
export default {
    data () {
        return {
            editForm: {
                password: '',
                newPassword: '',
                newPasswordCopy: ''
            },
            editFormRules: {
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
                            } else if (value !== this.editForm.newPassword) {
                                callback(new Error('两次密码不一致'))
                            } else {
                                callback()
                            }
                        },
                        trigger: 'blur'
                    },
                    { required: true, message: '请输入确认密码', trigger: 'submit' }
                ]
            },
            loading: false,
            dialogVisible: false
        }
    },
    methods: {
        handleEdit () {
            this.editForm = {
                password: '',
                newPassword: '',
                newPasswordCopy: ''
            }
            this.loading = false
            this.dialogVisible = true
        },
        handleClose () {
            this.editForm = {
                password: '',
                newPassword: '',
                newPasswordCopy: ''
            }
            this.loading = false
            this.dialogVisible = false
        },
        handleSubmit () {
            this.$refs.editForm.validate(async (valid) => {
                if (valid) {
                    try {
                        this.loading = true
                        await httpPost(`/api/users/password`, this.editForm)
                        this.handleClose()
                        this.$message.success('操作成功')
                    } catch (e) {
                        this.$message.error(e.message)
                        this.loading = false
                    } finally {

                    }
                }
            })
        }
    }
}
</script>
