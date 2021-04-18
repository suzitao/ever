<template>
    <el-dialog title="修改个人信息" :visible.sync="dialogVisible" :before-close="handleClose" width="650px">
        <el-form size="small" :model="editForm" :rules="editFormRules" ref="editForm" status-icon label-width="120px">
            <el-form-item label="手机号码" prop="cellphoneNumber">
                <el-input v-model="editForm.cellphoneNumber"></el-input>
            </el-form-item>
            <el-form-item label="E-mail" prop="email">
                <el-input v-model="editForm.email"></el-input>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button size="small" type="primary" @click="handleSubmit" :loading="loading">提交</el-button>
            <el-button size="small" @click="handleClose" :disabled="loading">取消</el-button>
        </div>
    </el-dialog>
</template>
<script>
import { httpGet } from '~/plugins/axios'
import { mapState } from 'vuex'
import { formatCanadaCellphoneNumber, validatePhoneNumber } from '~/plugins/tool'
export default {
    computed: {
        ...mapState(['user'])
    },
    data () {
        return {
            editForm: {
                cellphoneNumber: '',
                email: ''
            },
            editFormRules: {
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
                ],
                email: [
                    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
                    { required: true, message: '请输入E-mail', trigger: 'submit' }
                ]
            },
            loading: false,
            dialogVisible: false
        }
    },
    methods: {
        handleEdit () {
            this.editForm = {
                cellphoneNumber: this.user.cellphoneNumber,
                email: this.user.email
            }
            this.loading = false
            this.dialogVisible = true
        },
        handleClose () {
            this.editForm = {
                cellphoneNumber: '',
                email: ''
            }
            this.loading = false
            this.dialogVisible = false
        },
        handleSubmit () {
            this.$refs.editForm.validate(async (valid) => {
                if (valid) {
                    try {
                        this.loading = true
                        await this.$store.dispatch('personalInformation', this.editForm)
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
