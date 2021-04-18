<template>
    <div>
        <div class="toolbar">
            <el-button @click="editForm.dialogVisible = true" size="small">新增</el-button>
            <div style="display: inline-block; float: right; width: 400px">
                <el-input placeholder="输入用户名/真实姓名/E-mail/手机号码搜索" v-model="searchFormInput.mixSearch" size="small" @keyup.enter.native="search">
                    <el-button @click="search" slot="append" icon="el-icon-search"></el-button>
                </el-input>
            </div>
        </div>

        <el-table :data="list" border v-loading="loading">
            <el-table-column label="用户名" prop="username" min-width="160">
            </el-table-column>
            <el-table-column label="真实姓名" prop="realname" min-width="160">
            </el-table-column>
            <el-table-column label="手机号码" prop="cellphoneNumber" min-width="200">
            </el-table-column>
            <el-table-column label="E-mail" prop="email" min-width="283">
            </el-table-column>
            <el-table-column label="状态" prop="status" width="75">
                <template slot-scope="scope">
                    <status-tag :status="scope.row.status"/>
                </template>
            </el-table-column>
            <el-table-column width="250" label="操作">
                <template slot-scope="scope">
                    <el-button type="text" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="text" @click="$refs.permisionDialog.handleEdit(scope.row)">权限分配</el-button>
                    <el-button type="text" @click="handleResetPassword(scope.$index, scope.row)">重置密码</el-button>
                    <confirm-button type="text" tip="是否确认禁用 ?" @confirm="handleDisable(scope.$index, scope.row)" v-if="scope.row.status === 0">禁用</confirm-button>
                    <confirm-button type="text" tip="是否确认启用 ?" @confirm="handleEnable(scope.$index, scope.row)" v-if="scope.row.status === 1">启用</confirm-button>
                </template>
            </el-table-column>
        </el-table>
    
        <div class="toolbar toolbar-pager" v-if="list.length > 0">
            <el-pagination class="pager-block" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNo" :page-sizes="pageSizes" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </div>

        <el-dialog :title="editForm.id ? '编辑' : '新增'" :visible.sync="editForm.dialogVisible" :before-close="handleClose" class="edit-form-dialog">
            <el-form :model="editForm" :rules="editFormRules" ref="editForm" status-icon label-width="120px">
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
                    <el-input v-model="editForm.email"></el-input>
                </el-form-item>
                <el-form-item label="网点范围" prop="branchRanges">
                    <el-checkbox-group v-model="editForm.branchRanges" @change="changeBranchRanges">
                    <el-checkbox :label="branch._id" v-for="branch in branchs" :key="branch._id">{{branch.name}}</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item label="默认网点" prop="defaultBranch">
                    <el-select v-model="editForm.defaultBranch" placeholder="请选择默认网点">
                        <el-option :label="branch.name" :value="branch._id" v-for="branch in selectedBranchs" :key="branch._id"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submit" :loading="editForm.loading">提交</el-button>
                <el-button @click="handleClose">取消</el-button>
            </div>
        </el-dialog>
        <permision-dialog ref="permisionDialog"/>
    </div>
</template>
<script>
import { httpGet, httpPost } from '~/plugins/axios'
import { extend, smartExtend, formatCanadaCellphoneNumber, validatePhoneNumber } from '~/plugins/tool'
import pageMixins from '~/mixins/pageMixins'
import ConfirmButton from '~/components/ConfirmButton'
import StatusTag from '~/components/tag/StatusTag'
import PermisionDialog from '~/components/dialog/PermisionDialog'
import { mapState } from 'vuex'

export default {
    mixins: [pageMixins()],
    components: { ConfirmButton, StatusTag, PermisionDialog },
    data () {
        return {
            editForm: {
                id: '', // 有id编辑，无id新增
                username: '',
                realname: '',
                cellphoneNumber: '',
                email: '',
                branchRanges: [],
                defaultBranch: null,

                loading: false,
                dialogVisible: false
            },

            editFormRules: {
                username: [
                    {
                        validator: async (rule, value, callback) => {
                            const exp1 = /^[a-zA-Z]{1}[0-9A-Za-z]{4,19}$/
                            if (!value) {
                                callback()
                            } else if (!exp1.test(value)) {
                                callback(new Error('用户名由字母和数字组成，必须以字母开头，长度6-20位，不可包含特殊字符'))
                            } else if (await httpGet(`/api/users/isExist/username/?username=${value}&id=${this.editForm.id}`)) {
                                callback(new Error('用户名已存在'))
                            } else {
                                callback()
                            }
                        },
                        trigger: 'blur'
                    },
                    { required: true, message: '请输入用户名', trigger: 'submit' }
                ],
                realname: [
                    { required: true, message: '请输入真实姓名', trigger: 'submit' }
                ],
                cellphoneNumber: [
                    {
                        validator: async (rule, value, callback) => {
                            this.editForm.cellphoneNumber = formatCanadaCellphoneNumber(this.editForm.cellphoneNumber)
                            if (await httpGet(`/api/users/isExist/cellphoneNumber?cellphoneNumber=${this.editForm.cellphoneNumber}&id=${this.editForm.id}`)) {
                                callback(new Error('手机号码已经绑定其他账号'))
                            }
                            callback(validatePhoneNumber(this.editForm.cellphoneNumber, 'canada', '加拿大'))
                        },
                        trigger: 'blur'
                    },
                    { required: true, message: '请输入手机号码', trigger: 'submit' }
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
                            } else if (await httpGet(`/api/users/isExist/email/?email=${value}&id=${this.editForm.id}`)) {
                                callback(new Error('E-mail已经绑定其他账号'))
                            } else {
                                callback()
                            }
                        },
                        trigger: 'blur'
                    },
                    { required: true, message: '请输入E-mail', trigger: 'submit' }
                ],
                branchRanges: [
                    { type: 'array', required: true, message: '请选择网点范围', trigger: 'submit' }
                ],
                defaultBranch: [
                    { required: true, message: '请选择默认网点', trigger: 'submit' }
                ]
            }
        }
    },
    computed: {
        ...mapState('admin', ['branchs']),
        selectedBranchs () {
            const selectedBranchs = []
            if (this.branchs) {
                this.branchs.forEach(item => {
                    if (this.editForm.branchRanges.indexOf(item._id) !== -1) selectedBranchs.push(item)
                })
            }
            return selectedBranchs
        }
    },
    methods: {
        async onQueryList (params) {
            extend(params, {isAdmin: true})
            return httpGet(`/api/admin/user`, params)
        },
        handleEdit (index, row) {
            this.editForm.id = row._id
            smartExtend(this.editForm, row)
            this.editForm.dialogVisible = true
        },
        handleClose () {
            this.editForm = {
                id: '', // 有id编辑，无id新增
                username: '',
                realname: '',
                cellphoneNumber: '',
                email: '',
                branchRanges: [],
                defaultBranch: null,

                loading: false,
                dialogVisible: false
            }
            this.$refs.editForm.resetFields()
        },
        async handleResetPassword (index, row) {
            await this.$confirm('请谨慎操作!!!确认要将用户密码重置为E-mail吗?', '提示', {
                type: 'warning'
            })
            try {
                await httpPost(`/api/admin/user/${row._id}/resetPassword`)
                await this.$alert(`用户密码${row.username}密码已重置成功`, '提示')
            } catch (e) {
                this.$message.error(e.message)
            } finally {
            }
        },
        async onRowDelete (row, index) {
            // 员工不能删除
        },
        async onRowEnable (row, index) {
            return httpPost(`/api/admin/user/${row._id}/setEnable`)
        },
        async onRowDisable (row, index) {
            return httpPost(`/api/admin/user/${row._id}/setDisable`)
        },
        submit () {
            this.$refs.editForm.validate(async (valid) => {
                if (valid) {
                    try {
                        this.editForm.loading = true
                        await httpPost(
                            this.editForm.id
                                ? `/api/admin/user/${this.editForm.id}`
                                : '/api/admin/user', this.editForm)
                        this.handleClose()
                        this.queryList(this.pageNo)
                    } catch (e) {
                        this.$message.error(e.message)
                        this.editForm.loading = false
                    } finally {

                    }
                }
            })
        },
        changeBranchRanges (selectedBranchIds) {
            if (selectedBranchIds.indexOf(this.editForm.defaultBranch) === -1) this.editForm.defaultBranch = null
        }
    },
    mounted () {
        this.queryList()
    }
}
</script>

<style lang="less">
.edit-form-dialog {

    .el-dialog {
        width: 600px;

        .el-input {
            width: 217px;
        }
    }
}
</style>