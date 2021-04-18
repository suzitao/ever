<template>
    <div class="hone-commonGoods">
        <div class="toolbar-top" style="margin-bottom: 10px;">
            <el-button @click="editForm.dialogVisible = true" size="small" class="left">新增</el-button>
            <el-input placeholder="通过物品名称或品牌搜索" v-model="searchFormInput.mixSearch" size="small" @keyup.enter.native="search" class="right" style="width:300px">
                <el-button @click="search" slot="append" icon="el-icon-search"></el-button>
            </el-input>
        </div>
    
        <el-table :data="list" border v-loading="loading">
            <el-table-column label="物品名称" prop="name" show-overflow-tooltip>
            </el-table-column>
            <el-table-column label="品牌" prop="brand" show-overflow-tooltip>
            </el-table-column>
            <el-table-column label="申报单价($)" prop="valueDeclared" width="150">
            </el-table-column>
            <el-table-column label="规格" prop="measurementUnit" width="150" show-overflow-tooltip>
            </el-table-column>
            <el-table-column label="操作" width="90px">
                <template slot-scope="scope">
                    <el-button type="text" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <confirm-button type="text" tip="是否确认删除 ?" @confirm="handleDel(scope.$index, scope.row)">删除</confirm-button>
                </template>
            </el-table-column>
        </el-table>

        <div class="toolbar">
            <el-pagination class="pager-block" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNo" :page-sizes="pageSizes" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </div>

        <el-dialog title="常用物品信息编辑" :visible.sync="editForm.dialogVisible" :before-close="handleClose">
            <el-form :model="editForm" :rules="rules" ref="editForm" status-icon label-width="120px" class="demo-ruleForm" v-loading.body="editForm.loading">
                <el-form-item label="物品名称" prop="name">
                    <el-input v-model="editForm.name" placeholder="请输入物品名称"></el-input>
                </el-form-item>
                <el-form-item label="品牌" prop="brand">
                    <el-input v-model="editForm.brand" placeholder="请输入物品品牌"></el-input>
                </el-form-item>
                <el-form-item label="申报单价($)" prop="valueDeclared">
                    <el-input v-model.number="editForm.valueDeclared" placeholder=""></el-input>
                </el-form-item>
                <el-form-item label="规格" prop="measurementUnit">
                    <el-input v-model="editForm.measurementUnit" placeholder="例如：粒,kg,ml..."></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submit()">提交</el-button>
                    <el-button @click="handleClose()">取消</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
import pageMixins from '~/mixins/pageMixins'
import ConfirmButton from '~/components/ConfirmButton'
import { httpGet, httpPost, httpDelete } from '~/plugins/axios'
import { smartExtend } from '~/plugins/tool'

export default {
    mixins: [pageMixins()],
    components: {
        ConfirmButton
    },
    head: {
        title: '常用物品信息'
    },

    data () {
        return {
            label: '常用物品信息',

            editForm: {
                id: '', // 有id编辑，无id新增
                name: '',
                brand: '',
                valueDeclared: '',
                measurementUnit: '',

                loading: false,
                dialogVisible: false
            },

            rules: {
                name: [
                    { required: true, message: '物品名称为必填项', trigger: 'blur' }
                ],
                valueDeclared: [
                    { required: true, message: '申报单价为必填项' },
                    { type: 'number', message: '申报单价必须为数字值' }
                ],
                measurementUnit: [
                    { required: true, message: '计量单位为必填项', trigger: 'blur' }
                ]
            }
        }
    },

    methods: {
        async onQueryList (params) {
            return httpGet(`/api/users/commonGoods`, params)
        },

        handleEdit (index, row) {
            this.editForm.id = row._id
            smartExtend(this.editForm, row)
            this.editForm.dialogVisible = true
        },
        handleClose () {
            this.editForm = {
                id: '',
                name: '',
                brand: '',
                valueDeclared: '',
                measurementUnit: '',

                loading: false,
                dialogVisible: false
            }
            this.$refs.editForm.resetFields()
        },
        async onRowDelete (row, index) {
            return httpDelete(`/api/users/commonGoods/${row._id}`)
        },
        submit () {
            this.$refs.editForm.validate(async valid => {
                if (valid) {
                    try {
                        this.editForm.loading = true
                        await httpPost(
                            this.editForm.id
                                ? `/api/users/commonGoods/${this.editForm.id}`
                                : '/api/users/commonGoods', this.editForm)
                        this.queryList(this.pageNo)
                    } catch (e) {
                        this.$message.error(e.message)
                    } finally {
                        this.handleClose()
                        this.editForm.loading = false
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
