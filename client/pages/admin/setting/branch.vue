<template>
    <div>
        <div class="toolbar">
            <el-button @click="editForm.dialogVisible = true" size="small">新增</el-button>
            <div style="display: inline-block; float: right; width: 400px">
                <el-input placeholder="请输入网点编码或名称搜索" v-model="searchFormInput.mixSearch" size="small" @keyup.enter.native="search">
                    <el-button @click="search" slot="append" icon="el-icon-search"></el-button>
                </el-input>
            </div>
        </div>
    
        <el-table :data="list" border v-loading="loading">
            <el-table-column width="160" prop="branchNumber" label="网点编码" />
            <el-table-column width="160" prop="simpleCode" label="网点简码" />
            <el-table-column width="160" prop="name" label="名称" />
            <el-table-column prop="phoneNumber" label="电话号码" :formatter="row => row.phoneNumber.join(' | ')" />
            <el-table-column width="50px" label="营业点" prop="isSales" :formatter="row => row.isSales && '√'" />
            <el-table-column width="50px" label="集运中心" prop="isHub" :formatter="row => row.isHub && '√'" />
            <el-table-column width="50px" label="默认网点" prop="isDefault" :formatter="row => row.isDefault && '√'" />
            <el-table-column label="经营线路" prop="lineList" :formatter="row => row.lineList.map( item => item.name ).join(' | ')" />
            <el-table-column width="380px" label="操作">
                <template slot-scope="scope">
                    <el-button type="text" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="text" @click="handleLineListEdit(scope.$index, scope.row)">设置线路</el-button>
                    <el-button type="text" @click="$refs.branchPriceTypeDialog.handleEdit(scope.row)">设置价格</el-button>
                    <el-button type="text" @click="$refs.customPriceDialog.handleEdit(scope.row)">设置自定价格</el-button>
                    <confirm-button type="text" tip="是否确认禁用 ?" @confirm="handleDisable(scope.$index, scope.row)" v-if="scope.row.status === 0">禁用</confirm-button>
                    <confirm-button type="text" tip="是否确认启用 ?" @confirm="handleEnable(scope.$index, scope.row)" v-if="scope.row.status === 1">启用</confirm-button>
                    <confirm-button type="text" tip="是否确认删除 ?" @confirm="handleDel(scope.$index, scope.row)">删除</confirm-button>
                </template>
            </el-table-column>
        </el-table>

        <div class="toolbar toolbar-pager" v-if="list.length > 0">
            <el-pagination class="pager-block" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNo" :page-sizes="pageSizes" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </div>
    
        <el-dialog :title="editForm.id ? '编辑' : '新增'" :visible.sync="editForm.dialogVisible" :before-close="handleClose" width="650px">
            <el-form size="small" :model="editForm" label-width="80px" :rules="rules" ref="editForm" status-icon>
                <el-form-item label="编码" prop="branchNumber">
                    <el-input v-model="editForm.branchNumber"></el-input>
                </el-form-item>
                <el-form-item label="简码" prop="simpleCode">
                    <el-input v-model="editForm.simpleCode"></el-input>
                </el-form-item>
                <el-form-item label="名称" prop="name">
                    <el-input v-model="editForm.name"></el-input>
                </el-form-item>
                <el-form-item label="电话" prop="phoneNumber">
                    <input-array v-model="editForm.phoneNumber" label="+"></input-array>
                </el-form-item>
                <el-form-item label="地址" prop="address">
                    <el-input type="textarea" v-model="editForm.address"></el-input>
                </el-form-item>
                <el-form-item label="网点类型">
                    <el-checkbox v-model="editForm.isSales">营业点</el-checkbox>
                    <el-checkbox v-model="editForm.isHub">集运中心</el-checkbox>
                </el-form-item>
                <el-form-item label="默认" prop="isDefault">
                    <el-switch on-text="" off-text="" v-model="editForm.isDefault"></el-switch>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" type="primary" @click="submit" :loading="editForm.loading">提交</el-button>
                <el-button size="small" @click="handleClose">取消</el-button>
            </div>
        </el-dialog>

        <el-dialog title="设置线路" :visible.sync="lineListEditForm.dialogVisible" :before-close="handleLineListClose" width="650px">
            <el-checkbox-group size="small" v-model="lineListEditForm.lineList">
                <el-checkbox class="checkbox-block" :label="line._id" v-for="line in lines" :key="line._id">{{line.name}}</el-checkbox>
            </el-checkbox-group>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" type="primary" @click="lineListSubmit" :loading="lineListEditForm.loading">提交</el-button>
                <el-button size="small" @click="handleLineListClose">取消</el-button>
            </div>
        </el-dialog>

        <branch-price-dialog ref="priceDialog"></branch-price-dialog>
        <branch-custom-price-dialog ref="customPriceDialog"></branch-custom-price-dialog>
        <branch-price-type-dialog ref="branchPriceTypeDialog"></branch-price-type-dialog>
    </div>
</template>
<script>
import { httpGet, httpPost, httpDelete } from '~/plugins/axios'
import { smartExtend } from '~/plugins/tool'
import pageMixins from '~/mixins/pageMixins'
import ConfirmButton from '~/components/ConfirmButton'
import BranchPriceDialog from '~/components/dialog/BranchPriceDialog'
import BranchPriceTypeDialog from '~/components/dialog/BranchPriceTypeDialog'
import BranchCustomPriceDialog from '~/components/dialog/BranchCustomPriceDialog'
import InputArray from '~/components/InputArray'

export default {
    mixins: [pageMixins()],
    components: { InputArray, ConfirmButton, BranchPriceDialog, BranchPriceTypeDialog, BranchCustomPriceDialog },
    data () {
        return {
            editForm: {
                id: '', // 有id编辑，无id新增
                branchNumber: '',
                simpleCode: '',
                name: '',
                address: '',
                phoneNumber: [],
                isSales: false,
                isHub: false,
                isDefault: false,

                loading: false,
                dialogVisible: false
            },

            lines: [],

            lineListEditForm: {
                id: '',
                lineList: [],
                loading: false,
                dialogVisible: false
            },

            rules: {
                branchNumber: [
                    { required: true, message: '请输入网点编码', trigger: 'submit' }
                ],
                simpleCode: [
                    { required: true, message: '请输入网点简码', trigger: 'submit' },
                    { pattern: /^[A-Z]{2}$/, message: '简码必须为2位大写字母', trigger: 'submit' }
                ],
                name: [
                    { required: true, message: '请输入网点名称', trigger: 'submit' }
                ],
                phoneNumber: [
                    { type: 'array', required: true, message: '请至少输入一个电话号码', trigger: 'submit' }
                ]
            }
        }
    },
    methods: {
        async onQueryList (params) {
            return httpGet(`/api/admin/branchs`, params)
        },

        async onRowDelete (row, index) {
            return httpDelete(`/api/admin/branchs/${row._id}`)
        },
        async onRowEnable (row, index) {
            return httpPost(`/api/admin/branchs/${row._id}/setEnable`)
        },
        async onRowDisable (row, index) {
            return httpPost(`/api/admin/branchs/${row._id}/setDisable`)
        },
        handleEdit (index, row) {
            this.editForm.id = row._id
            smartExtend(this.editForm, row)
            this.editForm.dialogVisible = true
        },
        handleLineListEdit (index, row) {
            this.lineListEditForm.id = row._id
            this.lineListEditForm.lineList = row.lineList.map(item => item._id)
            this.lineListEditForm.dialogVisible = true
        },
        handlePriceEdit (index, row) {
            this.$refs.priceDialog.open(row)
        },
        handleClose () {
            this.editForm = {
                id: '', // 有id编辑，无id新增
                branchNumber: '',
                simpleCode: '',
                name: '',
                address: '',
                phoneNumber: [],
                isSales: false,
                isHub: false,
                isDefault: false,

                loading: false,
                dialogVisible: false
            }
        },
        handleLineListClose () {
            this.lineListEditForm = {
                id: '',
                lineList: [],

                loading: false,
                dialogVisible: false
            }
        },
        submit () {
            this.$refs.editForm.validate(async valid => {
                if (valid) {
                    try {
                        this.editForm.loading = true
                        await httpPost(
                            this.editForm.id
                                ? `/api/admin/branchs/${this.editForm.id}`
                                : '/api/admin/branchs', this.editForm)
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
        async lineListSubmit () {
            try {
                this.lineListEditForm.loading = true
                await httpPost(`/api/admin/branchs/${this.lineListEditForm.id}/setLineList`, this.lineListEditForm)
                this.handleLineListClose()
                this.queryList(this.pageNo)
            } catch (e) {
                this.$message.error(e.message)
                this.lineListEditForm.loading = false
            } finally {

            }
        },

        async queryLineList () {
            const { list } = await httpGet('/api/lines')
            this.lines = list
        }
    },
    mounted () {
        this.queryList()
        this.queryLineList()
    }
}
</script>
<style lang="less" scoped>
.checkbox-block {
    display: block;
    margin: 0 !important;
    padding: 5px 0;
}
</style>
