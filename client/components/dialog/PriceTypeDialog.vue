<template>
    <el-dialog :title="`设置价格类型[${line && line.name || ''}]`" :visible.sync="dialogVisible" :before-close="handleClose" width="650px" class="priceType-dialog">
        <div class="priceType-dialog-body">
            <el-table :data="list" border v-loading="loading">
                <el-table-column label="价格类型名称">
                    <template slot-scope="scope">
                        <el-input v-if="list[scope.$index].editable" v-model="list[scope.$index].name" placeholder="请输入价格类型名称"></el-input>
                        <span v-if="!list[scope.$index].editable">{{list[scope.$index].name}}</span>
                    </template>
                </el-table-column>
                <el-table-column label="状态" prop="status" width="75px">
                    <template slot-scope="scope">
                        <status-tag :status="scope.row.status"/>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="130px">
                    <template slot-scope="scope">
                        <el-button @click.native.prevent="list[scope.$index].editable = true" type="text" v-if="!list[scope.$index].editable">编辑</el-button>
                        <el-button @click.native.prevent="submit(scope.row)" type="text" v-if="list[scope.$index].editable">保存</el-button>
                        <el-button @click.native.prevent="handleEnable(scope.$index, scope.row)" type="text" v-if="list[scope.$index].status === 1 && list[scope.$index]._id">启用</el-button>
                        <el-button @click.native.prevent="handleDisable(scope.$index, scope.row)" type="text" v-if="list[scope.$index].status === 0 && list[scope.$index]._id">禁用</el-button>
                        <confirm-button type="text" tip="是否确认删除 ?" @confirm="handleDel(scope.$index, scope.row)" v-if="list[scope.$index]._id">删除</confirm-button>
                        <el-button @click.native.prevent="handleUnSaveDelete(scope.$index)" type="text" v-if="!list[scope.$index]._id">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div slot="footer" class="dialog-footer">
            <el-button size="small" type="primary" @click="list.push({ name: '', status: 0, line: line._id, editable: true, index: list.length > 0 ? (list[list.length - 1].index + 1) : 0 })" :disabled="loading">增加一行</el-button>
            <el-button size="small" @click="handleClose">关闭</el-button>
        </div>
    </el-dialog>
</template>

<script>
import { httpGet, httpPost, httpDelete } from '~/plugins/axios'
import pageMixins from '~/mixins/pageMixins'
import ConfirmButton from '~/components/ConfirmButton'
import StatusTag from '~/components/tag/StatusTag'
export default {
    mixins: [pageMixins({ pageSize: 1000 })],
    components: { ConfirmButton, StatusTag },
    data () {
        return {
            line: null,
            dialogVisible: false
        }
    },
    methods: {
        async handleEdit (line) {
            this.dialogVisible = true
            this.line = line
            this.queryList(1)
        },
        async onQueryList (params) {
            params.lineId = this.line._id
            return httpGet(`/api/admin/priceType`, params)
        },
        async onRowDelete (row, index) {
            return httpDelete(`/api/admin/priceType/${row._id}`)
        },
        async onRowEnable (row, index) {
            return httpPost(`/api/admin/priceType/${row._id}/enable`)
        },
        async onRowDisable (row, index) {
            return httpPost(`/api/admin/priceType/${row._id}/disable`)
        },
        afterDataQuery () {
            this.list.forEach(item => {
                this.$set(item, 'editable', false)
            })
        },
        handleUnSaveDelete (index) {
            this.list.splice(index, 1)
        },
        handleClose () {
            this.dialogVisible = false
            this.line = null
            this.list = []
            this.loading = true
        },
        async submit (row) {
            try {
                this.loading = true
                await httpPost(row._id ? `/api/admin/priceType/${row._id}` : '/api/admin/priceType', row)
                this.$message.success('操作成功')
                this.queryList(1)
            } catch (e) {
                this.$message.error(e.message)
                this.loading = false
            }
        }
    }
}
</script>

<style lang="less">
.priceType-dialog {

    .priceType-dialog-body {
        width: 100%;
        height: 500px;
        overflow: auto;
    }
}
</style>
