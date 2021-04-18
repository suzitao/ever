<template>
    <el-dialog :title="'设置价格' + (user && user.name || '')" :visible.sync="dialogVisible" :before-close="handleClose" width="650px" class="branch-price-type-dialog">
        <div class="branch-price-type-dialog-body" v-loading="loading">
            <div v-for="(line, index) in editForm" :key="line._id">
                <div class="divider">{{line.name}}</div>
                <el-table :data="line.items" border>
                    <el-table-column label="价格类型" :formatter="row => row.name || ''">
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
import { httpGet, httpPost } from '~/plugins/axios'
import { deepCopy } from '~/plugins/tool'
export default {
    data () {
        return {
            user: null,
            editForm: [],

            loading: true,
            submitLoading: false,
            dialogVisible: false
        }
    },
    methods: {
        async handleEdit (user) {
            this.dialogVisible = true
            this.user = user
            const listParams = { userId: user._id, pageSize: 1000 }
            const [
                userPriceTypes,
                userBranchCustomPrices
            ] = await Promise.all([
                (await httpGet(`/api/admin/userPriceType`, listParams)).list,
                (await httpGet(`/api/admin/userBranchCustomPrice`, listParams)).list
            ])
            const currentBranch = await httpGet(`/api/admin/branchs/current`)
            const branchId = currentBranch._id

            let editForm = deepCopy(currentBranch.lineList)
            await Promise.all(editForm.map(async group => {
                const lineId = group._id
                const [priceTypeList, branchCustomPriceList] = await Promise.all([
                    (await httpGet(`/api/admin/priceType`, { lineId })).list,
                    (await httpGet(`/api/admin/branchCustomPrice`, { lineId, branchId })).list
                ])

                const generateTable = (itemList, key) => {
                    return item => {
                        const priceItem = (itemList.filter(f => f[key] === item[key]._id))[0] || {}
                        const {
                            unitPrice = '',
                            poundSurcharge = '',
                            startingWeight = '',
                            _id = null
                        } = priceItem
                        return {
                            ...item,
                            _id,
                            unitPrice,
                            poundSurcharge,
                            startingWeight
                        }
                    }
                }

                const priceTypeListItems = priceTypeList.map(priceType => ({ priceType, name: priceType.name })).map(generateTable(userPriceTypes, 'priceType'))

                const branchCustomPriceListItems = branchCustomPriceList.map(branchCustomPrice => ({ branchCustomPrice, name: branchCustomPrice.name })).map(generateTable(userBranchCustomPrices, 'branchCustomPrice'))
                group.items = [
                    ...priceTypeListItems,
                    ...branchCustomPriceListItems
                ]
            }))
            this.editForm = editForm
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
                let userPriceTypeArray = []
                let branchCustomPriceType = []
                for (const group of this.editForm) {
                    group.items.forEach(item => {
                        if (item.priceType) {
                            userPriceTypeArray.push(item)
                        } else {
                            branchCustomPriceType.push(item)
                        }
                    })
                }
                await httpPost(`/api/admin/userPriceType/${this.user._id}`, userPriceTypeArray)
                await httpPost(`/api/admin/userBranchCustomPrice/${this.user._id}`, branchCustomPriceType)
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

.divider {
    margin:8px 0;
}
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
