<template>
    <div>
        <div class="toolbar">
            <div style="display: inline-block; float: right; width: 400px">
                <el-input placeholder="托盘号/提单号" slot="prepend" v-model="searchFormInput.mixSearch" size="small" @keyup.enter.native="search">
                    <el-button @click="search" slot="append" icon="el-icon-search">
                    </el-button>
                </el-input>
            </div>
        </div>

        <el-table ref="table" :data="list" border v-loading="loading" @selection-change="handleSelectionChange" @row-click="(row) => $refs.table.toggleRowSelection(row)">
            <el-table-column type="selection" width="35px">
            </el-table-column>
            <el-table-column min-width="145px" label="托盘号" prop="palletNumber">
                <template slot-scope="scope">
                    <nuxt-link target="_blank" :to="'/admin/pallet/' + scope.row._id">{{scope.row.palletNumber}}</nuxt-link>
                </template>
            </el-table-column>
            <el-table-column min-width="90px" prop="state" label="状态">
                <template slot-scope="scope">
                    <pallet-state-tag :state="scope.row.state"/>
                </template>
            </el-table-column>
            <el-table-column min-width="158px" label="网点" prop="branch" :formatter="row => row.branch && row.branch.name || ''">
            </el-table-column>
            <el-table-column min-width="130px" label="托盘重量" prop="weight" :formatter="row => row.weight + 'LB/' + (row.weight * 0.4536).toFixed(2) + 'KG'">
            </el-table-column>
            <el-table-column min-width="160px" label="运单总重量" prop="orderActualWeight" :formatter="row => row.orderActualWeight && `${row.orderActualWeight}LB/${(row.orderActualWeight * 0.4536).toFixed(2)}KG` || ''">
            </el-table-column>
            <el-table-column min-width="120px" label="运单统计" prop="orderQuantity">
                <template slot-scope="scope">
                    <span v-if="scope.row.orderQuantity !== undefined" v-for="(item, index) in [{name: 'orderQuantity', color: 'black'}, {name: 'notDispatchOrder', color: 'red'}, {name: 'dispatchingOrder', color: 'blue'}, {name: 'dispatchedOrder', color: 'green'}]" :key="index">
                        <span v-if="index">/</span>
                        <span :style="{color: item.color}">{{scope.row[item.name]}}</span>
                    </span>
                </template>
            </el-table-column>
            <el-table-column min-width="95px" label="发货线路" prop="lineList" :formatter="row => row.lineList.map( item => item.lineNumber ).join('/')">
            </el-table-column>
            <el-table-column min-width="150px" label="提单号" prop="ladingBillNumber">
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="140px" :formatter="row => row.createTime && formatDate(new Date(row.createTime), 'yy/MM/dd HH:mm')">
            </el-table-column>
            <el-table-column min-width="170px" label="操作">
                <template slot-scope="scope">
                    <el-button type="text" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <confirm-button type="text" tip="是否确认删除 ?" @confirm="handleDel(scope.$index, scope.row)" v-if="scope.row.state === 10">删除</confirm-button>
                    <confirm-button type="text" tip="是否确认封盘 ?" @confirm="handleClosePallet(scope.$index, scope.row)" v-if="scope.row.state === 10">封盘</confirm-button>
                    <confirm-button type="text" tip="是否确认反封盘 ?" @confirm="handleOpenPallet(scope.$index, scope.row)" v-if="scope.row.state === 20">反封盘</confirm-button>
                    <el-button type="text" @click="handleTransportPallet(scope.$index, scope.row)" v-if="scope.row.state === 20">发出</el-button>
                    <el-button type="text" @click="handleTakeoffPallet(scope.$index, scope.row)" v-if="scope.row.state === 30">起飞</el-button>
                    <el-button type="text" @click="handleReceivePallet(scope.$index, scope.row)" v-if="scope.row.state === 35">收到</el-button>
                    <el-button type="text" @click="handleClearPallet(scope.$index, scope.row)" v-if="scope.row.state === 40">开始清关</el-button>
                </template>
            </el-table-column>
        </el-table>
        <div class="toolbar toolbar-pager" v-if="list.length > 0">
            <el-button @click="countPallet" size="small" :disabled="selectedList.length < 1 ||!countReady">统计</el-button>
            <el-pagination class="pager-block" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNo" :page-sizes="pageSizes" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </div>

        <el-dialog title="托盘编辑" custom-class="width:800px" :visible.sync="dialogVisible" :before-close="handleClose">
            <el-form :model="editForm" :rules="rules" ref="editForm" status-icon label-width="100px" class="demo-editForm">
                <el-form-item label="托盘号">
                    <el-input v-model="editForm.palletNumber" :disabled="true"></el-input>
                </el-form-item>
                <el-form-item label="托盘重量" prop="weight">
                    <el-input v-model.number="editForm.weight"><template slot="append">LB(磅)</template></el-input>
                </el-form-item>
                 <!-- <el-form-item label="发货线路" prop="lineList">
                    <el-transfer v-model="editForm.lineList" :data="transferData">
                    </el-transfer>
                </el-form-item>  -->
                <el-form-item label="空运价格" prop="airFreightPrice">
                    <el-input v-model.number="editForm.airFreightPrice"><template slot="append">$</template></el-input>
                </el-form-item>
                <el-form-item label="提单号">
                    <el-input v-model="editForm.ladingBillNumber"></el-input>
                </el-form-item>
                <el-form-item label="网点备注">
                    <el-input v-model.number="editForm.remark"></el-input>
                </el-form-item>
                <el-form-item label="清关备注">
                    <el-input v-model.number="editForm.clearanceRemark"></el-input>
                </el-form-item>
                <el-form-item label="附件">
                    <file-uploader ref="fileUploader" v-model="editForm.fileList"></file-uploader>
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
import pageMixins from '~/mixins/pageMixins'
import ConfirmButton from '~/components/ConfirmButton'
import FileUploader from '~/components/FileUploader'
import { httpGet, httpPost, httpDelete } from '~/plugins/axios'
import { smartExtend, formatDate } from '~/plugins/tool'
import PalletStateTag from '~/components/tag/PalletStateTag'

const palletCountKeys = ['weight', 'orderActualWeight', 'orderFreight', 'orderMaterialCost', 'orderPremium', 'orderAmountWithoutTariff', 'orderTariff']
const getInitialPalletCount = () => {
    return {
        weight: 0,
        orderActualWeight: 0,
        orderFreight: 0,
        orderMaterialCost: 0,
        orderPremium: 0,
        orderAmountWithoutTariff: 0,
        orderTariff: 0
    }
}

const palletCountReducer = (acc, currentPallet) => {
    palletCountKeys.forEach(key => {
        acc[key] += currentPallet[key]
    })
    return acc
}

function getPalletCountMessage (palletInfo, h) {
    const formatWeight = val => {
        return `${val.toFixed(2)}LB/${(val * 0.4536).toFixed(2)}KG`
    }
    const formatMoney = val => {
        return `$${val.toFixed(2)}`
    }
    const {
        weight,
        orderActualWeight,
        orderFreight,
        orderMaterialCost,
        orderPremium,
        orderAmountWithoutTariff,
        orderTariff,
        length
    } = palletInfo

    const lengthMessage = `托盘数： ${length}`
    const palletWeight = `托盘重量 ${formatWeight(weight)}`
    const orderWeight = `运单重量 ${formatWeight(orderActualWeight)}`
    const freightCost = `运费统计 ${formatMoney(orderFreight)}`
    const materialCost = `物料费统计 ${formatMoney(orderMaterialCost)}`
    const premiumCost = `保险费统计 ${formatMoney(orderPremium)}`
    const withoutTariff = `未税金额统计 ${formatMoney(orderAmountWithoutTariff)}`
    const withTariff = `预付关税统计 ${formatMoney(orderTariff)}`
    const messageLines = [
        lengthMessage,
        palletWeight,
        orderWeight,
        freightCost,
        materialCost,
        premiumCost,
        withoutTariff,
        withTariff
    ]
    const listElements = messageLines.map(number => h('div', null, number))
    return h('div', null, listElements)
}

export default {
    mixins: [pageMixins()],
    components: { ConfirmButton, FileUploader, PalletStateTag },
    head: {
        title: '托盘管理'
    },
    data () {
        return {
            transferData: [],
            editForm: {
                id: '', // 有id编辑，无id新增
                palletNumber: '',
                weight: '',
                lineList: [],
                airFreightPrice: '',
                ladingBillNumber: '',
                remark: '',
                clearanceRemark: '',
                fileList: [],

                loading: false
            },

            dialogVisible: false,

            rules: {
                weight: [
                    { required: true, message: '托盘重量不能为空' },
                    { type: 'number', message: '托盘重量必须为数字值', trigger: 'submit' }
                ],
                lineList: [
                    { type: 'array', required: true, message: '请至少选择一个发货线路', trigger: 'submit' }
                ],
                airFreightPrice: [
                    {
                        validator: (rule, value, callback) => {
                            const exp = /^([1-9][\d]{0,7}|0)(\.[\d]{1,2})?$/
                            if (!value) {
                                callback()
                            } else if ((!exp.test(value)) || value === '0' || value === 0) {
                                callback(new Error('请输入正确的价格'))
                            } else {
                                callback()
                            }
                        },
                        trigger: 'submit'
                    }
                ]
            },
            selectedList: [],
            countReady: false
        }
    },

    methods: {
        countPallet () {
            const palletCount = this.selectedList.reduce(palletCountReducer, getInitialPalletCount())
            const palletCountInfo = {...palletCount, length: this.selectedList.length}
            const message = getPalletCountMessage(palletCountInfo, this.$createElement)
            this.$alert(message, '统计', { confirmButtonText: '关闭' })
        },
        handleSelectionChange (val) {
            this.selectedList = val
        },
        formatDate,
        async onQueryList (params) {
            this.countReady = false
            return httpGet(`/api/admin/pallet`, params)
        },
        async afterDataQuery () {
            const countData = await httpPost('/api/admin/pallet/count', { ids: this.list.map(item => item._id) })
            this.countReady = true
            for (let index in this.list) {
                this.$set(this.list[index], 'orderActualWeight', countData[index].orderActualWeight)
                this.$set(this.list[index], 'orderQuantity', countData[index].orderQuantity)
                this.$set(this.list[index], 'notDispatchOrder', countData[index].notDispatchOrder)
                this.$set(this.list[index], 'dispatchingOrder', countData[index].dispatchingOrder)
                this.$set(this.list[index], 'dispatchedOrder', countData[index].dispatchedOrder)
                this.$set(this.list[index], 'orderFreight', countData[index].orderFreight)
                this.$set(this.list[index], 'orderMaterialCost', countData[index].orderMaterialCost)
                this.$set(this.list[index], 'orderPremium', countData[index].orderPremium)
                this.$set(this.list[index], 'orderAmountWithoutTariff', countData[index].orderAmountWithoutTariff)
                this.$set(this.list[index], 'orderTariff', countData[index].orderTariff)
            }
        },
        handleEdit (index, row) {
            this.editForm.id = row._id
            smartExtend(this.editForm, row)
            this.editForm.lineList = row.lineList.map(item => item._id)
            this.dialogVisible = true
        },
        handleClose () {
            this.dialogVisible = false
            this.editForm = {
                id: '', // 有id编辑，无id新增
                palletNumber: '',
                weight: '',
                lineList: [],
                airFreightPrice: '',
                ladingBillNumber: '',
                remark: '',
                clearanceRemark: '',
                fileList: [],

                loading: false
            }
        },
        async queryLineList () {
            const [lines] = await Promise.all([
                httpGet('/api/lines')
            ])
            this.transferData = []
            for (var index in lines.list) {
                this.transferData.push({
                    key: lines.list[index]._id,
                    label: lines.list[index].name,
                    disabled: false
                })
            }
        },
        async onRowDelete (row, index) {
            return httpDelete(`/api/admin/pallet/${row._id}`)
        },
        async handleClosePallet (index, row) {
            try {
                this.loading = true
                await httpPost(`/api/admin/pallet/${row._id}/close`)
                row.state = 20
            } catch (e) {
                this.$message.error(e.message)
            } finally {
                this.loading = false
            }
        },
        async handleOpenPallet (index, row) {
            try {
                this.loading = true
                await httpPost(`/api/admin/pallet/${row._id}/open`)
                row.state = 10
            } catch (e) {
                this.$message.error(e.message)
            } finally {
                this.loading = false
            }
        },
        async handleTransportPallet (index, row) {
            await this.$confirm('当前操作不可逆，是否确认发出', '提示', {
                confirmButtonText: '确认',
                cancelButtonText: '取消',
                type: 'warning'
            })
            try {
                this.loading = true
                await httpPost(`/api/admin/pallet/${row._id}/transport`)
                row.state = 30
            } catch (e) {
                this.$message.error(e.message)
            } finally {
                this.loading = false
            }
        },
        async handleTakeoffPallet (index, row) {
            await this.$confirm('当前操作不可逆，是否确认发出', '提示', {
                confirmButtonText: '确认',
                cancelButtonText: '取消',
                type: 'warning'
            })
            try {
                this.loading = true
                await httpPost(`/api/admin/pallet/${row._id}/takeoff`)
                row.state = 35
            } catch (e) {
                this.$message.error(e.message)
            } finally {
                this.loading = false
            }
        },
        async handleReceivePallet (index, row) {
            await this.$confirm('当前操作不可逆，是否确认收到', '提示', {
                confirmButtonText: '确认',
                cancelButtonText: '取消',
                type: 'warning'
            })
            try {
                this.loading = true
                await httpPost(`/api/admin/pallet/${row._id}/receive`)
                row.state = 40
            } catch (e) {
                this.$message.error(e.message)
            } finally {
                this.loading = false
            }
        },
        async handleClearPallet (index, row) {
            await this.$confirm('当前操作不可逆，是否确认开始清关', '提示', {
                confirmButtonText: '确认',
                cancelButtonText: '取消',
                type: 'warning'
            })
            try {
                this.loading = true
                await httpPost(`/api/admin/pallet/${row._id}/clear`)
                row.state = 50
            } catch (e) {
                this.$message.error(e.message)
            } finally {
                this.loading = false
            }
        },
        openPalletOrder (row) {
            window.open('/admin/pallet/' + row._id)
        },
        async submit () {
            await this.$refs.editForm.validate()
            // await this.$refs.fileUploaderAfterSubmit.submitUpload()
            try {
                this.editForm.loading = true
                await httpPost(
                    this.editForm.id
                        ? `/api/admin/pallet/${this.editForm.id}`
                        : '/api/admin/pallet', this.editForm)
                this.queryList(this.pageNo)
                this.handleClose()
            } catch (e) {
                this.$message.error(e.message)
                this.editForm.loading = false
            }
        }
    },
    mounted () {
        this.queryLineList()
        this.queryList()
        // 获取线路
    }
}
</script>
<style>
</style>
