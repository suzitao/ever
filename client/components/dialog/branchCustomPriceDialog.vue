<template>
    <el-dialog :title="`设置自定价格类型 [${branch && branch.name}] ${selectedLine && selectedLine.name || ''}`" :visible.sync="dialogVisible" :before-close="handleClose" width="800px" class="custom-price-dialog">
        <el-select placeholder="请选择发货线路" @change="handleLineChange" v-model="selectedLineId">
            <el-option :label="line.name" :value="line._id" v-for="line in lines" :key="line._id"></el-option>
        </el-select>
        <div class="custom-price-dialog-body" v-if="selectedLine">
            <el-table :data="list" border v-loading="loading">
                    <el-table-column label="价格类型名称">
                        <template slot-scope="scope">
                            <el-input v-if="list[scope.$index].editable" v-model="list[scope.$index].name" placeholder="请输入价格类型名称"></el-input>
                            <span v-if="!list[scope.$index].editable">{{list[scope.$index].name}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="单价" >
                        <template slot-scope="scope">
                            <el-input v-if="list[scope.$index].editable" v-model="list[scope.$index].unitPrice" placeholder="请输入单价"></el-input>
                            <span v-if="!list[scope.$index].editable">{{list[scope.$index].unitPrice}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="首磅附加费" >
                        <template slot-scope="scope">
                            <el-input v-if="list[scope.$index].editable" v-model="list[scope.$index].poundSurcharge" placeholder="请输入首磅附加费"></el-input>
                            <span v-if="!list[scope.$index].editable">{{list[scope.$index].poundSurcharge}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="最低计费重量">
                        <template slot-scope="scope">
                            <el-input v-if="list[scope.$index].editable" v-model="list[scope.$index].startingWeight" placeholder="请输入最低计费重量"></el-input>
                            <span v-if="!list[scope.$index].editable">{{list[scope.$index].startingWeight}}</span>
                        </template>
                    </el-table-column>
                     <el-table-column label="状态" prop="status" width="75px">
                         <template slot-scope="scope">
                            <status-tag :status="scope.row.status"/>
                         </template>
                    </el-table-column>
                    <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button @click.native.prevent="editRow(scope.$index)" type="text" v-if="!list[scope.$index].editable">编辑</el-button>
                        <el-button @click.native.prevent="submit(scope.row)" type="text" v-if="list[scope.$index].editable">保存</el-button>
                        <el-button @click.native.prevent="handleEnable(scope.row)" type="text" v-if="list[scope.$index].status === 1 && list[scope.$index]._id">启用</el-button>
                        <el-button @click.native.prevent="handleDisable(scope.row)" type="text" v-if="list[scope.$index].status === 0 && list[scope.$index]._id">禁用</el-button>
                        <confirm-button type="text" tip="是否确认删除 ?" @confirm="handleDelete(scope.row)" v-if="list[scope.$index]._id">删除</confirm-button>
                        <el-button @click.native.prevent="handleUnSaveDelete(scope.$index)" type="text" v-if="!list[scope.$index]._id">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div slot="footer" class="dialog-footer">
            <el-button size="small" type="primary" @click="addNewPrice" :disabled="!selectedLine || loading">增加一行</el-button>
            <el-button size="small" @click="handleClose">关闭</el-button>
        </div>
    </el-dialog>
</template>

<script>
import { httpGet, httpPost, httpDelete } from '~/plugins/axios'
import ConfirmButton from '~/components/ConfirmButton'
import StatusTag from '~/components/tag/StatusTag'

const getNewIndex = list => {
    const listLength = list.length
    if (listLength === 0) {
        return 0
    }
    const lastElementIndex = list[listLength - 1].index
    return lastElementIndex + 1
}

export default {
    components: { ConfirmButton, StatusTag },
    computed: {
        selectedLineId: {
            get () {
                if (this.selectedLine) {
                    return this.selectedLine._id
                }
                return null
            },
            set (newVal) {
                return newVal
            }
        }
    },
    data () {
        return {
            loading: false,
            list: [],
            lines: [],
            selectedLine: null,
            branch: null,
            dialogVisible: false
        }
    },
    methods: {
        async handleEdit (branch) {
            this.dialogVisible = true
            this.branch = branch
            this.lines = branch.lineList
        },
        async fetchList () {
            this.loading = true
            const params = {
                lineId: this.selectedLine._id,
                branchId: this.branch._id
            }
            const response = await httpGet(`/api/admin/branchCustomPrice`, params)
            this.list = response.list.map(item => {
                return {...item, editable: false}
            })
            this.loading = false
        },
        handleUnSaveDelete (index) {
            this.list.splice(index, 1)
        },
        async handleDelete (row) {
            try {
                this.loading = true
                await httpDelete(`/api/admin/branchCustomPrice/${row._id}`)
                this.$message.success('操作成功')
                this.fetchList()
            } catch (e) {
                this.$message.error(e.message)
                this.loading = false
            }
        },
        async handleEnable (row) {
            try {
                this.loading = true
                await httpPost(`/api/admin/branchCustomPrice/${row._id}/enable`)
                this.$message.success('操作成功')
                this.fetchList()
            } catch (e) {
                this.$message.error(e.message)
                this.loading = false
            }
        },
        async handleDisable (row) {
            try {
                this.loading = true
                await httpPost(`/api/admin/branchCustomPrice/${row._id}/disable`)
                this.$message.success('操作成功')
                this.fetchList()
            } catch (e) {
                this.$message.error(e.message)
                this.loading = false
            }
        },
        async submit (row) {
            try {
                this.loading = true
                const { _id } = row
                const url = _id ? `/api/admin/branchCustomPrice/${_id}` : '/api/admin/branchCustomPrice'
                await httpPost(url, row)
                this.$message.success('操作成功')
                this.fetchList()
            } catch (e) {
                this.$message.error(e.message)
                this.loading = false
            }
        },
        editRow (index) {
            this.list[index].editable = true
        },
        addNewPrice () {
            const newIndex = getNewIndex(this.list)
            const newPrice = {
                name: '',
                status: 0,
                line: this.selectedLine._id,
                branch: this.branch._id,
                editable: true,
                index: newIndex
            }
            this.list.push(newPrice)
        },
        handleLineChange (val) {
            this.selectedLine = this.lines.find(line => line._id === val)
            this.fetchList()
        },
        handleClose () {
            this.dialogVisible = false
            this.lines = []
            this.list = []
            this.selectedLine = null
            this.selectedLineId = null
            this.branch = null
        }
    }
}
</script>

<style lang="less">
.custom-price-dialog {

    .custom-price-dialog-body {
        margin-top:20px;
        width: 100%;
        overflow: auto;
    }
}
</style>
