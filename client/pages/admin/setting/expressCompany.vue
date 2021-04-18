<template>
    <div>
        <div class="toolbar">
            <el-button @click="editForm.dialogVisible = true" size="small">新增</el-button>
            <div style="display: inline-block; float: right; width: 400px">
                <el-input placeholder="请输入快递公司代码或名称搜索" v-model="searchFormInput.mixSearch" size="small" @keyup.enter.native="search">
                    <el-button @click="search" slot="append" icon="el-icon-search"></el-button>
                </el-input>
            </div>
        </div>

        <el-table :data="list" border v-loading="loading">
            <el-table-column label="快递公司代码" prop="expressCompanyNumber">
            </el-table-column>
            <el-table-column label="快递公司名称" prop="name">
            </el-table-column>
            <el-table-column width="250px" label="操作">
                <template slot-scope="scope">
                    <el-button type="text" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <confirm-button type="text" tip="是否确认删除 ?" @confirm="handleDel(scope.$index, scope.row)">删除</confirm-button>
                </template>
            </el-table-column>
        </el-table>
    
        <div class="toolbar toolbar-pager" v-if="list.length > 0">
            <el-pagination class="pager-block" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNo" :page-sizes="pageSizes" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </div>

        <el-dialog :title="editForm.id ? '编辑' : '新增'" :visible.sync="editForm.dialogVisible" :before-close="handleClose" width="650px">
            <el-form size="small" :model="editForm" :rules="rules" ref="editForm" status-icon label-width="120px">
                <el-form-item label="快递公司代码" prop="expressCompanyNumber">
                    <el-input v-model="editForm.expressCompanyNumber"></el-input>
                </el-form-item>
                <el-form-item label="快递公司名称" prop="name">
                    <el-input v-model="editForm.name"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" type="primary" @click="submit" :loading="editForm.loading">提交</el-button>
                <el-button size="small" @click="handleClose">取消</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
import { httpGet, httpPost, httpDelete } from '~/plugins/axios'
import { smartExtend } from '~/plugins/tool'
import pageMixins from '~/mixins/pageMixins'
import ConfirmButton from '~/components/ConfirmButton'

export default {
    mixins: [pageMixins()],
    components: { ConfirmButton },
    data () {
        return {
            editForm: {
                id: '', // 有id编辑，无id新增
                expressCompanyNumber: '',
                name: '',

                loading: false,
                dialogVisible: false
            },

            rules: {
                expressCompanyNumber: [
                    { required: true, message: '请输入快递公司代码', trigger: 'submit' }
                ],
                name: [
                    { required: true, message: '请输入快递公司名称', trigger: 'submit' }
                ]
            }
        }
    },

    methods: {
        async onQueryList (params) {
            return httpGet(`/api/admin/expressCompany`, params)
        },
        async onRowDelete (row, index) {
            return httpDelete(`/api/admin/expressCompany/${row._id}`)
        },
        handleEdit (index, row) {
            this.editForm.id = row._id
            smartExtend(this.editForm, row)
            this.editForm.dialogVisible = true
        },
        handleClose () {
            this.editForm = {
                id: '', // 有id编辑，无id新增
                expressCompanyNumber: '',
                name: '',

                dialogVisible: false,
                loading: false
            }
            this.$refs.editForm.resetFields()
        },
        submit () {
            this.$refs.editForm.validate(async (valid) => {
                if (valid) {
                    try {
                        this.editForm.loading = true
                        await httpPost(
                            this.editForm.id
                                ? `/api/admin/expressCompany/${this.editForm.id}`
                                : '/api/admin/expressCompany', this.editForm)
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
