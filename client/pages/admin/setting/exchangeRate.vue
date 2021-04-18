<template>
    <div>
        <div class="toolbar">
            <el-button @click="editForm.dialogVisible = true" size="small">新增</el-button>
            <div style="display: inline-block; float: right; width: 400px">
                系统汇率值以创建日期最新的为准
            </div>
        </div>

        <el-table :data="list" border v-loading="loading">
            <el-table-column label="汇率值" prop="value">
            </el-table-column>
            <el-table-column label="创建日期" prop="createTime" :formatter="formateCreateTime">
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
                <el-row :gutter="10">
                    <el-col :span="18">
                        <el-form-item label="汇率值" prop="value">
                            <el-input v-model="editForm.value"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <div class="float-right">
                            <el-button size="small" type="primary" @click="submit" :loading="editForm.loading">提交</el-button>
                            <el-button size="small" @click="handleClose">取消</el-button>
                        </div>
                    </el-col>
                </el-row>
            </el-form>
        </el-dialog>
    </div>
</template>
<script>
import { httpGet, httpPost, httpDelete } from '~/plugins/axios'
import { smartExtend, formatDate } from '~/plugins/tool'
import pageMixins from '~/mixins/pageMixins'
import ConfirmButton from '~/components/ConfirmButton'

export default {
    mixins: [pageMixins()],
    components: { ConfirmButton },
    data () {
        return {
            editForm: {
                id: '', // 有id编辑，无id新增
                value: '',

                loading: false,
                dialogVisible: false
            },

            rules: {
                value: [
                    {
                        validator: (rule, value, callback) => {
                            const exp = /^(?!(0[0-9]{0,}$))[0-9]{1,}[.]{0,}[0-9]{0,}$/
                            if (!value) {
                                callback()
                            } else if ((!exp.test(value)) || value === '0' || value === 0) {
                                callback(new Error('汇率值为大于0的数字'))
                            } else {
                                callback()
                            }
                        },
                        trigger: 'blur'
                    },
                    { required: true, message: '请输入汇率值', trigger: 'submit' }
                ]
            }
        }
    },

    methods: {
        formateCreateTime (row) {
            return row.createTime && formatDate(new Date(row.createTime), 'yyyy/MM/dd HH:mm')
        },
        async onQueryList (params) {
            return httpGet(`/api/admin/exchangeRate`, params)
        },
        async onRowDelete (row, index) {
            return httpDelete(`/api/admin/exchangeRate/${row._id}`)
        },
        handleEdit (index, row) {
            this.editForm.id = row._id
            smartExtend(this.editForm, row)
            this.editForm.dialogVisible = true
        },
        handleClose () {
            this.editForm = {
                id: '', // 有id编辑，无id新增
                value: '',

                loading: false,
                dialogVisible: false
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
                                ? `/api/admin/exchangeRate/${this.editForm.id}`
                                : '/api/admin/exchangeRate', this.editForm)
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
