<template>
    <div>
        <div class="toolbar">
            <el-radio-group class="toptool-left" v-model="activeTab" size="small" @change="handleChangeTab">
                <el-radio-button v-for="tab in tabs" :label="tab.number" :key="tab.number">{{tab.name}}</el-radio-button>
            </el-radio-group>
            <div style="display: inline-block; float: right; width: 400px">
                <el-input placeholder="输入用户名/真实姓名/E-mail/手机号码搜索" v-model="searchFormInput.mixSearch" size="small" @keyup.enter.native="search">
                    <el-button @click="search" slot="append" icon="el-icon-search"></el-button>
                </el-input>
            </div>
        </div>

        <el-table ref="table" :data="list" border @row-dblclick="row => openUrl(`/admin/customer/-10-90/${row._id}`)" v-loading="loading" @selection-change="handleSelectionChange" @row-click="(row) => $refs.table.toggleRowSelection(row)">
            <el-table-column type="selection" width="35px">
            </el-table-column>
            <el-table-column min-width="125" label="用户名" prop="username">
                <template slot-scope="scope">
                    <nuxt-link target="_blank" :to="'/admin/customer/-10-90/' + scope.row._id">{{scope.row.username}}</nuxt-link>
                </template>
            </el-table-column>
            <el-table-column min-width="125" label="真实姓名" prop="realname">
            </el-table-column>
            <el-table-column min-width="100" label="手机号码" prop="cellphoneNumber">
            </el-table-column>
            <el-table-column min-width="200" label="E-mail" prop="email">
            </el-table-column>
            <el-table-column width="75" label="状态" prop="status">
                <template slot-scope="scope">
                    <status-tag :status="scope.row.status"/>
                </template>
            </el-table-column>
            <el-table-column label="账户余额" prop="accountAmount">
            </el-table-column>
            <el-table-column width="500px" label="操作">
                <template slot-scope="scope">
                    <el-button type="text" @click="openUrl(`/admin/customer/10/${scope.row._id}`)">待收货运单</el-button>
                    <el-button type="text" @click="handleRechargeEdit(scope.$index, scope.row)" v-if="scope.row.status === 0">充值/提现</el-button>
                    <el-button type="text" @click="$refs.userPriceTypeDialog.handleEdit(scope.row)">设置价格</el-button>
                    <el-button type="text" @click="handleEdit(scope.$index, scope.row)">编辑信息</el-button>
                    <el-button type="text" @click="handleResetPassword(scope.$index, scope.row)">重置密码</el-button>
                    <confirm-button type="text" tip="是否确认禁用 ?" @confirm="handleSingleDisable(scope.row)" v-if="scope.row.status !== 1">禁用</confirm-button>
                    <confirm-button type="text" tip="是否确认启用 ?" @confirm="handleSingleEnable(scope.row)" v-if="scope.row.status !== 0">启用</confirm-button>
                    <confirm-button type="text" tip="是否确认删除 ?" @confirm="handleSingleDelete(scope.row)" v-if="scope.row.status !== 2">删除</confirm-button>
                </template>
            </el-table-column>
        </el-table>
    
        <div class="toolbar toolbar-pager" v-if="list.length > 0">
            <confirm-button type="plain" tip="是否批量禁用 ?" size="small" @confirm="handleBatchDisable()" :disabled="activeTab === 1 || this.selectedList.length === 0">禁用</confirm-button>
            <confirm-button type="plain" tip="是否批量启用 ?" size="small" @confirm="handleBatchEnable()"
            :disabled="activeTab === 0 || this.selectedList.length === 0">启用</confirm-button>
            <confirm-button type="plain" tip="是否批量删除 ?" size="small" @confirm="handleBatchDelete()"
            :disabled="activeTab === 2 || this.selectedList.length === 0">删除</confirm-button>
            <el-pagination class="pager-block" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNo" :page-sizes="pageSizes" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </div>

        <el-dialog :title="editForm.id ? '编辑' : '新增'" :visible.sync="editForm.dialogVisible" :before-close="handleClose">
            <el-form :model="editForm" :rules="rules" ref="editForm" status-icon label-width="120px">
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
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submit" :loading="editForm.loading">提交</el-button>
                <el-button @click="handleClose">取消</el-button>
            </div>
        </el-dialog>

        <!-- 充值界面 -->
        <el-dialog title="充值/提现" :visible.sync="rechangeEditForm.dialogVisible" :before-close="handleRechangeClose" width="650px">
            <el-form size="small" :model="rechangeEditForm" :rules="rechangeRules" status-icon ref="rechangeEditForm" label-width="120px">
                <el-form-item label="用户名">
                    <el-input v-model="rechangeEditForm.username" :disabled="true"></el-input>
                </el-form-item>
                <el-form-item label="真实姓名">
                    <el-input v-model="rechangeEditForm.realname" :disabled="true"></el-input>
                </el-form-item>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="金额" prop="inputAmount">
                            <el-input v-model="rechangeEditForm.inputAmount"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="账户余额：">
                            {{rechangeEditForm.accountAmount}}
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="支付方式" prop="occurMethod">
                    <el-radio-group v-model="rechangeEditForm.occurMethod">
                        <el-radio-button label=10>现金</el-radio-button>
                        <el-radio-button label=20>POS</el-radio-button>
                        <el-radio-button label=40>支付宝转账</el-radio-button>
                        <el-radio-button label=45>微信转账</el-radio-button>
                        <el-radio-button label=60>汇款</el-radio-button>
                        <el-radio-button label=65>支票</el-radio-button>
                        <el-radio-button label=70>其它</el-radio-button>
                    </el-radio-group>
                </el-form-item>
                    <el-form-item label="备注说明" prop="illustration">
                    <el-input v-model="rechangeEditForm.illustration"></el-input>
                </el-form-item>
                <el-form-item label="" prop="type">
                    <el-radio-group v-model="rechangeEditForm.type">
                        <el-radio label=1>充值</el-radio>
                        <el-radio label=-1>提现</el-radio>
                    </el-radio-group>
                </el-form-item>  
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" type="primary" @click="rechange" :loading="rechangeEditForm.loading">提交</el-button>
                <el-button size="small" @click="handleRechangeClose">取消</el-button>
            </div>
        </el-dialog>
        <user-price-type-dialog ref="userPriceTypeDialog"></user-price-type-dialog>
    </div>
</template>
<script>
import { httpGet, httpPost } from '~/plugins/axios'
import { extend, smartExtend, formatCanadaCellphoneNumber, validatePhoneNumber, openUrl } from '~/plugins/tool'
import pageMixins from '~/mixins/pageMixins'
import ConfirmButton from '~/components/ConfirmButton'
import StatusTag from '~/components/tag/StatusTag'
import UserPriceTypeDialog from '~/components/dialog/userPriceTypeDialog'

export default {
    mixins: [pageMixins()],
    components: { ConfirmButton, StatusTag, UserPriceTypeDialog },
    data () {
        return {
            editForm: {
                id: '', // 有id编辑，无id新增
                username: '',
                realname: '',
                cellphoneNumber: '',
                email: '',

                loading: false,
                dialogVisible: false
            },

            rechangeEditForm: {
                id: '', // 有id编辑，无id新增
                username: '',
                realname: '',
                inputAmount: '',
                occurMethod: '',
                illustration: '',
                type: '',
                amount: 0,
                accountAmount: '',

                loading: false,
                dialogVisible: false
            },

            rules: {
                username: [
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
                    { required: true, message: '请输入E-mail', trigger: 'submit' }
                ]
            },

            rechangeRules: {
                inputAmount: [
                    {
                        validator: (rule, value, callback) => {
                            const exp = /^([1-9][\d]{0,7}|0)(\.[\d]{1,2})?$/
                            if (!value) {
                                callback()
                            } else if ((!exp.test(value)) || value === '0') {
                                callback(new Error('请输入正确的金额(大于0且小数点后不超过2位)'))
                            } else if (this.rechangeEditForm.type === '-1' && this.rechangeEditForm.accountAmount <= 0) {
                                callback(new Error('账户没有余额不能提现'))
                            } else if (this.rechangeEditForm.type === '-1' && this.rechangeEditForm.inputAmount > this.rechangeEditForm.accountAmount) {
                                callback(new Error('提现金额不能超过账户余额'))
                            } else {
                                callback()
                            }
                        },
                        trigger: 'blur'
                    },
                    { required: true, message: '请输入金额', trigger: 'submit' }
                ],
                occurMethod: [
                    { required: true, message: '请选择支付方式', trigger: 'submit' }
                ],
                type: [
                    { required: true, message: '请选择充值或者提现', trigger: 'submit' }
                ]
            },
            selectedList: [],
            activeTab: -1,
            tabs: [
                { number: -1, name: '全部' },
                { number: 0, name: '正常' },
                { number: 1, name: '禁用' },
                { number: 2, name: '已删除' }
            ]
        }
    },

    methods: {
        async handleUpdate (fetch) {
            try {
                this.loading = true
                await fetch()
                this.$message.success('操作成功')
                await this.queryList()
            } catch (e) {
                this.$message.error(e.message)
            } finally {
                this.loading = false
            }
        },
        async handleBatchDisable () {
            const userIdList = this.selectedList.map(user => user._id)
            const fetch = async () => {
                return httpPost(`/api/admin/user/setBatchDisable`, {userIdList})
            }
            this.handleUpdate(fetch)
        },
        async handleBatchEnable () {
            const userIdList = this.selectedList.map(user => user._id)
            const fetch = async () => {
                return httpPost(`/api/admin/user/setBatchEnable`, {userIdList})
            }
            this.handleUpdate(fetch)
        },
        async handleBatchDelete () {
            const userIdList = this.selectedList.map(user => user._id)
            const fetch = async () => {
                return httpPost(`/api/admin/user/setBatchDelete`, {userIdList})
            }
            this.handleUpdate(fetch)
        },
        async handleSingleDisable (row) {
            const fetch = async () => {
                return httpPost(`/api/admin/user/${row._id}/setDisable`)
            }
            this.handleUpdate(fetch)
        },
        async handleSingleEnable (row) {
            const fetch = async () => {
                return httpPost(`/api/admin/user/${row._id}/setEnable`)
            }
            this.handleUpdate(fetch)
        },
        async handleSingleDelete (row) {
            const fetch = async () => {
                return httpPost(`/api/admin/user/${row._id}/setDelete`)
            }
            this.handleUpdate(fetch)
        },
        handleSelectionChange (val) {
            this.selectedList = val
        },
        handleChangeTab () {
            this.queryList()
        },
        openUrl,
        async onQueryList (params) {
            extend(params, {isAdmin: false})
            if (this.activeTab >= 0) {
                extend(params, {status: [this.activeTab]})
            }
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

                loading: false,
                dialogVisible: false
            }
            this.$refs.editForm.resetFields()
        },
        handleRechargeEdit (index, row) {
            this.rechangeEditForm.id = row._id
            smartExtend(this.rechangeEditForm, row)
            this.rechangeEditForm.dialogVisible = true
        },
        handleRechangeClose () {
            this.rechangeEditForm = {
                id: '',
                username: '',
                realname: '',
                inputAmount: '',
                occurMethod: '',
                illustration: '',
                type: '',
                amount: 0,
                accountAmount: '',

                loading: false,
                dialogVisible: false
            }
            this.$refs.rechangeEditForm.resetFields()
        },
        async handleResetPassword (index, row) {
            await this.$confirm('请谨慎操作!!!确认要将客户密码重置为E-mail吗?', '提示', {
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
        async onRowEnable (row, index) {
            return httpPost(`/api/admin/user/${row._id}/setEnable`)
        },
        async onRowDisable (row, index) {
            return httpPost(`/api/admin/user/${row._id}/setDisable`)
        },
        async onRowDelete (row, index) {
            return httpPost(`/api/admin/user/${row._id}/setDelete`)
        },
        submit () {
            this.$refs.editForm.validate(async (valid) => {
                if (valid) {
                    await this.$confirm('请谨慎操作!!!确认修改客户信息?', '提示', {
                        type: 'warning'
                    })
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
        rechange () {
            this.$refs.rechangeEditForm.validate(async (valid) => {
                if (valid) {
                    const confirmMessage = `是否确认为(用户名:${this.rechangeEditForm.username}  真实姓名:${this.rechangeEditForm.realname})${(this.rechangeEditForm.type === '1') ? '充值' : '提现'}${this.rechangeEditForm.inputAmount}元?`
                    await this.$confirm(confirmMessage, '提示', {
                        type: 'warning'
                    })
                    try {
                        this.rechangeEditForm.loading = true
                        this.rechangeEditForm.amount = this.rechangeEditForm.inputAmount * this.rechangeEditForm.type
                        await httpPost(`/api/admin/user/${this.rechangeEditForm.id}/recahnge`, this.rechangeEditForm)
                        this.queryList(this.pageNo)
                        await this.$alert(`成功:(用户名:${this.rechangeEditForm.username}  真实姓名:${this.rechangeEditForm.realname})${(this.rechangeEditForm.type === '1') ? '充值' : '提现'}${this.rechangeEditForm.inputAmount}元`)
                        this.handleRechangeClose()
                    } catch (e) {
                        this.$message.error(e.message)
                        this.rechangeEditForm.loading = false
                    } finally {

                    }
                }
            })
        }
    },
    mounted () {
        this.queryList()
    }
}
</script>
