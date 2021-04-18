<template>
    <el-dialog :title="'设置价格' + (branch && branch.name || '')" :visible.sync="dialogVisible" :before-close="handleClose" width="650px" class="branch-price-type-dialog">
        <div class="branch-price-type-dialog-body" v-loading="loading">
            <div v-for="(line, index) in editForm" :key="line._id">
                <div>{{line.name}}</div>
                <el-table :data="line.items" border>
                    <el-table-column label="价格类型" :formatter="row => row.priceType && row.priceType.name || ''">
                    </el-table-column>
                    <el-table-column label="单价">
                        <template slot-scope="scope">
                            <el-input v-model="editForm[index].items[scope.$index].unitPrice" placeholder="请输入单价"></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column label="首磅附加费">
                        <template slot-scope="scope">
                            <el-input v-model="editForm[index].items[scope.$index].poundSurcharge" placeholder="请输入首磅附加费"></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column label="最低计费重量">
                        <template slot-scope="scope">
                            <el-input v-model="editForm[index].items[scope.$index].startingWeight" placeholder="请输入最低计费重量"></el-input>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
        <div slot="footer" class="dialog-footer">
            <el-button size="small" type="primary" @click="handleSubmit" :loading="submitLoading">提交</el-button>
            <el-button size="small" @click="handleClose">取消</el-button>
        </div>
    </el-dialog>
</template>

<script>
// permissionItem/getAllPermissionItem
import { httpGet, httpPost } from '~/plugins/axios'
import { deepCopy } from '~/plugins/tool'
export default {
    data () {
        return {
            branch: null,
            editForm: [],

            loading: true,
            submitLoading: false,
            dialogVisible: false
        }
    },
    methods: {
        async handleEdit (branch) {
            this.dialogVisible = true
            this.branch = branch
            const branch$priceTypes = (await httpGet(`/api/admin/branchpriceType`, { branchId: branch._id, pageSize: 1000 })).list
            this.editForm = deepCopy(branch.lineList)
            console.log(branch.lineList)
            await Promise.all(this.editForm.map(async group => {
                const { list } = await httpGet(`/api/admin/priceType`, { lineId: group._id })
                group.items = list.map(priceType => {
                    return { priceType }
                })
                group.items.forEach(item => {
                    const branch$priceType = (branch$priceTypes.filter(f => f.priceType === item.priceType._id))[0]
                    item.unitPrice = (branch$priceType && branch$priceType.unitPrice) || ''
                    item.poundSurcharge = (branch$priceType && branch$priceType.poundSurcharge) || ''
                    item.startingWeight = (branch$priceType && branch$priceType.startingWeight) || ''
                })
            }))
            this.loading = false
        },
        handleClose () {
            this.user = null
            this.editForm = []
            this.loading = true
            this.submitLoading = false
            this.dialogVisible = false
        },
        async handleSubmit () {
            if (this.loading) return
            this.submitLoading = true
            try {
                let tempArr = []
                for (const group of this.editForm) {
                    tempArr = tempArr.concat(group.items)
                }
                console.log(tempArr)
                await httpPost(`/api/admin/branchpriceType/${this.branch._id}`, tempArr)
                this.handleClose()
            } catch (e) {
                this.$message.error(e.message)
                this.submitLoading = false
            }
        }
    }
}
</script>

<style lang="less">
.branch-price-type-dialog {

    .branch-price-type-dialog-body {
        width: 100%;
        height: 500px;
        overflow: auto;

        .branch-price-type-container {
            width: 100%;

            .container-lable {
                margin-left: 10px;
            }

            .container-inner {
                width: 100%;
                padding: 10px;
                box-sizing: border-box;
                border: 1px solid #ebeef5;
            }
        }

        .branch-price-type-container + .branch-price-type-container {
            margin-top: 10px;
        }
    }
}
</style>
