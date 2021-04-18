<template>
    <div>
        <div class="toolbar">
            <el-button @click="editForm.dialogVisible = true" size="small">新增</el-button>
            <div style="display: inline-block; float: right; width: 400px">
                <el-input placeholder="请输入姓名/手机号码/身份证号码搜索" v-model="searchFormInput.mixSearch" size="small" @keyup.enter.native="search">
                    <el-button @click="search" slot="append" icon="el-icon-search"></el-button>
                </el-input>
            </div>
        </div>

        <el-table :data="list" border v-loading="loading">
            <el-table-column label="姓名" prop="name">
            </el-table-column>
            <el-table-column label="手机号码" prop="cellphoneNumber">
            </el-table-column>
            <el-table-column label="身份证号码" prop="idNumber">
            </el-table-column>
            <el-table-column label="身份证图" width="95px" align='center'>
                <template slot-scope="scope">
                    <el-row :gutter="2" v-if="scope.row.idNumber&&scope.row.idCardPositiveImg&&scope.row.idCardBackImg">
                        <el-col :span="12"><idcard v-model="scope.row.idCardPositiveImg">正面</idcard></el-col>
                        <el-col :span="12"><idcard v-model="scope.row.idCardBackImg">背面</idcard></el-col>
                    </el-row>
                    <font color="green" v-if="scope.row.idNumber&&(!(scope.row.idCardPositiveImg&&scope.row.idCardBackImg))">未传图片</font>
                    <font color="red" v-if="!(scope.row.idNumber)">未填号码</font>
                </template>
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

        <el-dialog :title="editForm.id ? '编辑' : '新增'" :visible.sync="editForm.dialogVisible" :before-close="handleClose">
            <el-form :model="editForm" :rules="rules" ref="editForm" status-icon label-width="120px">
                <el-form-item label="姓名" prop="name">
                    <el-input v-model="editForm.name"></el-input>
                </el-form-item>
                <el-form-item label="手机号码" prop="cellphoneNumber">
                    <el-input v-model="editForm.cellphoneNumber"></el-input>
                </el-form-item>
                <el-form-item label="身份证号码" prop="idNumber">
                    <el-input v-model="editForm.idNumber"></el-input>
                </el-form-item>
                <el-form-item label="证件上传" prop="idCardImg">
                    <div class="el-row--flex">
                        <id-card-upload v-model="editForm.idCardPositiveImg">点击上传正面</id-card-upload>
                        <id-card-upload v-model="editForm.idCardBackImg" style="margin-left:20px;">点击上传背面</id-card-upload>
                    </div>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submit" :loading="editForm.loading">提交</el-button>
                <el-button @click="handleClose">取消</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
import { httpGet, httpPost, httpDelete } from '~/plugins/axios'
import { smartExtend } from '~/plugins/tool'
import pageMixins from '~/mixins/pageMixins'
import ConfirmButton from '~/components/ConfirmButton'
import Idcard from '~/components/Idcard'
import idCardUpload from '~/components/idCardUpload'

export default {
    mixins: [pageMixins()],
    components: { ConfirmButton, Idcard, idCardUpload },
    data () {
        return {
            editForm: {
                id: '', // 有id编辑，无id新增
                name: '',
                cellphoneNumber: '',
                idNumber: '',
                idCardPositiveImg: null,
                idCardBackImg: null,

                loading: false,
                dialogVisible: false
            },

            rules: {
                name: [
                    { required: true, message: '请输入姓名', trigger: 'submit' }
                ],
                cellphoneNumber: [
                    { required: true, message: '请输入手机号码', trigger: 'submit' }
                ],
                idNumber: [
                    { required: true, message: '请输入身份证号码', trigger: 'submit' }
                ],
                idCardImg: [
                    {
                        validator: (rule, value, callback) => {
                            if (this.editForm.idCardPositiveImg && (!this.editForm.idCardBackImg)) {
                                callback(new Error('请同时上传证件正反面'))
                            } else if ((!this.editForm.idCardPositiveImg) && this.editForm.idCardBackImg) {
                                callback(new Error('请同时上传证件正反面'))
                            } else {
                                callback()
                            }
                        },
                        trigger: 'submit'
                    }
                ]
            }
        }
    },

    methods: {
        async onQueryList (params) {
            return httpGet(`/api/admin/personInfo`, params)
        },
        async onRowDelete (row, index) {
            return httpDelete(`/api/admin/personInfo/${row._id}`)
        },
        handleEdit (index, row) {
            this.editForm.id = row._id
            smartExtend(this.editForm, row)
            this.editForm.dialogVisible = true
        },
        handleClose () {
            this.editForm = {
                id: '', // 有id编辑，无id新增
                name: '',
                cellphoneNumber: '',
                idNumber: '',
                idCardPositiveImg: null,
                idCardBackImg: null,

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
                                ? `/api/admin/personInfo/${this.editForm.id}`
                                : '/api/admin/personInfo', this.editForm)
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
