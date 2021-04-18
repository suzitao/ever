<template>
    <div>
        <div class="toolbar">
            <el-button @click="addNew" size="small">新增</el-button>
            <div style="display: inline-block; float: right; width: 400px">
                <el-input placeholder="请输入文章编码或标题搜索" v-model="searchFormInput.mixSearch" size="small" @keyup.enter.native="search">
                    <el-button @click="search" slot="append" icon="el-icon-search"></el-button>
                </el-input>
            </div>
        </div>

        <el-table :data="list" border v-loading="loading">
            <el-table-column label="编码" prop="articleNumber" min-width="250s">
            </el-table-column>
            <el-table-column label="类型" prop="type" min-width="100px" :formatter="row => typeList[row.type]">
            </el-table-column>
            <el-table-column label="标题" prop="title" min-width="500">
            </el-table-column>
            <el-table-column label="状态" prop="status" width="75">
                <template slot-scope="scope">
                    <status-tag :status="scope.row.status"/>
                </template>
            </el-table-column>
            <el-table-column label="操作" min-width="250px">
                <template slot-scope="scope">
                    <confirm-button type="text" tip="是否确认禁用 ?" @confirm="handleDisable(scope.$index, scope.row)" v-if="scope.row.status === 0">禁用</confirm-button>
                    <confirm-button type="text" tip="是否确认启用 ?" @confirm="handleEnable(scope.$index, scope.row)" v-if="scope.row.status === 1">启用</confirm-button>
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
            <el-form :model="editForm" :rules="rules" status-icon ref="editForm" label-width="120px">
                <el-form-item label="编码" prop="articleNumber">
                    <el-input v-model="editForm.articleNumber"></el-input>
                </el-form-item>
                <el-form-item label="标题" prop="title">
                    <el-input v-model="editForm.title"></el-input>
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
import pageMixins from '~/mixins/pageMixins'
import ConfirmButton from '~/components/ConfirmButton'
import StatusTag from '~/components/tag/StatusTag'

export default {
    mixins: [pageMixins()],
    components: { ConfirmButton, StatusTag },
    data () {
        return {
            typeList: {
                0: '优惠信息',
                1: '外部公告',
                2: '内部公告',
                3: '产品介绍'
            },
            editForm: {
                id: '', // 有id编辑，无id新增
                articleNumber: '',
                title: '',

                loading: false,
                dialogVisible: false
            },

            rules: {
                articleNumber: [
                    { required: true, message: '编码', trigger: 'submit' }
                ],
                title: [
                    { required: true, message: '标题', trigger: 'submit' }
                ]
            }
        }
    },

    methods: {
        addNew () {
            this.$router.push('/admin/setting/article/edit')
        },
        async onQueryList (params) {
            return httpGet(`/api/admin/article`, params)
        },
        async onRowDelete (row, index) {
            return httpDelete(`/api/admin/article/${row._id}`)
        },
        async onRowEnable (row, index) {
            return httpPost(`/api/admin/article/${row._id}/setEnable`)
        },
        async onRowDisable (row, index) {
            return httpPost(`/api/admin/article/${row._id}/setDisable`)
        },
        handleEdit (index, row) {
            this.$router.push(`/admin/setting/article/edit/${row._id}`)
        },
        handleClose () {
            this.editForm = {
                id: '', // 有id编辑，无id新增
                articleNumber: '',
                title: '',

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
                                ? `/api/admin/article/${this.editForm.id}`
                                : '/api/admin/article', this.editForm)
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
