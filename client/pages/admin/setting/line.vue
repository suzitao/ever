<template>
    <div>
        <div class="toolbar">
            <el-button @click="editForm.dialogVisible = true" size="small">新增</el-button>
            <div style="display: inline-block; float: right; width: 400px">
                <el-input placeholder="请输入线路编码或名称搜索" v-model="searchFormInput.mixSearch" size="small" @keyup.enter.native="search">
                    <el-button @click="search" slot="append" icon="el-icon-search"></el-button>
                </el-input>
            </div>
        </div>
    
        <el-table :data="list" border v-loading="loading">
            <el-table-column width="80" prop="lineNumber" label="编码">
            </el-table-column>
            <el-table-column width="120" prop="name" label="名称">
            </el-table-column>
            <el-table-column prop="description" label="线路说明">
            </el-table-column>
            <el-table-column width="100" prop="tariffType" label="关税类型" :formatter="row => row.tariffType && tariffTypeList[row.tariffType] || ''">
            </el-table-column>
            <el-table-column width="250px" label="操作">
                <template slot-scope="scope">
                    <el-button type="text" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="text" @click="$refs.priceTypeDialog.handleEdit(scope.row)">设置价格类型</el-button>
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
                <el-form-item label="编码" prop="lineNumber">
                    <el-input v-model="editForm.lineNumber"></el-input>
                </el-form-item>
                <el-form-item label="名称" prop="name">
                    <el-input v-model="editForm.name"></el-input>
                </el-form-item>
                <el-form-item label="线路说明" prop="description">
                    <el-input v-model="editForm.description"></el-input>
                </el-form-item>
                <el-form-item label="关税类型" prop="tariffType">
                    <el-radio-group v-model="editForm.tariffType">
                        <el-radio label="0">后付</el-radio>
                        <el-radio label="1">预付</el-radio>
                        <el-radio label="2">包税</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="是否支持增加保价金额" prop="isSupportValueDeclared" label-width="160px">
                    <el-switch v-model="editForm.isSupportValueDeclared"></el-switch>
                </el-form-item>
                <el-form-item label="保险费率" prop="valueDeclaredRate">
                    <el-input v-model="editForm.valueDeclaredRate"></el-input>
                </el-form-item>
                <el-form-item label="默认保额" prop="defaultCoverage">
                    <el-input v-model="editForm.defaultCoverage"></el-input>
                </el-form-item>
                <el-form-item label="最高保额" prop="maxCoverage">
                    <el-input v-model="editForm.maxCoverage"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" type="primary" @click="submit" :loading="editForm.loading">提交</el-button>
                <el-button size="small" @click="handleClose">取消</el-button>
            </div>
        </el-dialog>
        <price-type-dialog ref="priceTypeDialog"/>
    </div>
</template>
<script>
import { httpGet, httpPost, httpDelete } from '~/plugins/axios'
import { smartExtend } from '~/plugins/tool'
import pageMixins from '~/mixins/pageMixins'
import ConfirmButton from '~/components/ConfirmButton'
import PriceTypeDialog from '~/components/dialog/PriceTypeDialog'

export default {
    mixins: [pageMixins()],
    components: { ConfirmButton, PriceTypeDialog },
    data () {
        return {
            tariffTypeList: {
                0: '后付',
                1: '预付',
                2: '包税'
            },

            editForm: {
                id: '', // 有id编辑，无id新增
                lineNumber: '',
                name: '',
                description: '',
                tariffType: '',
                isSupportValueDeclared: false,
                valueDeclaredRate: 0.01,
                defaultCoverage: 0,
                maxCoverage: 0,

                loading: false,
                dialogVisible: false
            },

            rules: {
                lineNumber: [
                    { required: true, message: '请输入线路编码', trigger: 'submit' }
                ],
                name: [
                    { required: true, message: '请输入线路名称', trigger: 'submit' }
                ],
                description: [
                    { required: true, message: '请输入线路说明', trigger: 'submit' }
                ],
                tariffType: [
                    { required: true, message: '请输入线路说明', trigger: 'submit' }
                ]
            }
        }
    },
    methods: {
        async onQueryList (params) {
            return httpGet(`/api/admin/line`, params)
        },
        async onRowDelete (row, index) {
            return httpDelete(`/api/admin/line/${row._id}`)
        },
        async onRowEnable (row, index) {
            return httpPost(`/api/admin/line/${row._id}/setEnable`)
        },
        async onRowDisable (row, index) {
            return httpPost(`/api/admin/line/${row._id}/setDisable`)
        },
        handleEdit (index, row) {
            this.editForm.id = row._id
            smartExtend(this.editForm, row)
            this.editForm.dialogVisible = true
        },
        handleClose () {
            this.editForm = {
                id: '', // 有id编辑，无id新增
                lineNumber: '',
                name: '',
                description: '',
                tariffType: '',
                isSupportValueDeclared: false,
                valueDeclaredRate: 0.01,
                defaultCoverage: 0,
                maxCoverage: 0,

                loading: false,
                dialogVisible: false
            }
            this.$refs.editForm.resetFields()
        },
        submit () {
            this.$refs.editForm.validate(async valid => {
                if (valid) {
                    try {
                        this.editForm.loading = true
                        await httpPost(
                            this.editForm.id
                                ? `/api/admin/line/${this.editForm.id}`
                                : '/api/admin/line', this.editForm)
                        this.handleClose()
                        this.queryList(this.pageNo)
                    } catch (e) {
                        this.$message.error(e.message)
                        this.editForm.loading = false
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
