<template>
    <div>
        <el-row :gutter="10">
            <el-col :span="4">
                <div style="background: rgba(218, 218, 218, 0.28);padding: 10px;">
                    <el-select v-model="selectedLine" placeholder="请选择发货线路" @change="handleLineChange">
                        <el-option :label="line.name" :value="line._id" v-for="line in lines" :key="line._id"></el-option>
                    </el-select>
                </div>
                <div v-if="selectedLine" style="background: rgba(218, 218, 218, 0.28);padding: 10px;display:flex;flex-direction:column;height: 714px;overflow-y:auto;border-top: solid #eeeeee 1px;">
                    <el-button style="margin:0;margin-top:10px;" type="primary" :disabled="selectedPriceType && selectedPriceType._id === price._id" @click="selectPriceType(price)" v-for="price in activeBranchPriceTypes" :key="price._id">{{price.name}} ${{price.unitPrice}}</el-button>
                </div>
            </el-col>
            <el-col v-if="selectedLine" :span="4">
                <div style="background: rgba(218, 218, 218, 0.28);padding: 10px;">
                    <el-input placeholder="扫描运单号" ref="searchInput" v-model="searchForm.orderNumber" @keyup.enter.native="queryOrder">
                        <el-button @click="queryOrder" slot="append" :loading="searchForm.loading">添加</el-button>
                    </el-input>
                </div>
                <div style="background: rgba(218, 218, 218, 0.28);padding: 10px;">
                    <el-button @click="$refs.batchWeighOrderDialog.handleEdit()" :loading="searchForm.loading">批量添加运单</el-button>
                </div>
                <div style="background: rgba(218, 218, 218, 0.28);padding: 10px;display:flex;flex-direction:column;height: 714px;overflow-y:auto;border-top: solid #eeeeee 1px;">
                    <el-tag style="margin-top: 10px;" :key="order" v-for="order in orderNumberList" closable :disable-transitions="false" @close="handleDeleteOrder(order)" :type="order === selectedOrder.orderNumber ? 'success' :''">{{order}}</el-tag>
                </div>
            </el-col>
            <el-col v-if="selectedLine" :span="16">
                <div class="weigh-panel" style="height:369px;">
                    <el-form v-if="selectedOrder" :model="selectedOrder" ref="selectedOrder" status-icon label-width="80px">
                        <el-row>
                            <el-form-item label="收件地址">
                                <weigh-item>{{selectedOrder.recipientAddress.join(' | ')}}</weigh-item>
                            </el-form-item>
                        </el-row>
                        <el-row>
                            <el-col :span="8">
                                <el-form-item label="运单号码">
                                    <weigh-item>{{selectedOrder.orderNumber}}</weigh-item>
                                </el-form-item>
                            </el-col>
                            <el-col :span="8">
                                <el-form-item label="发货网点">
                                    <weigh-item>{{selectedOrder.branch.name}}</weigh-item>
                                </el-form-item>
                            </el-col>
                            <el-col :span="8">
                                <el-form-item label="申报总价">
                                    <weigh-item>${{totalValueDeclared}}</weigh-item>
                                </el-form-item>
                            </el-col>
                        </el-row>
                            <el-row>
                                <el-table :data="selectedOrder.orderGoods" border height="223">
                                    <el-table-column prop="name" label="物品名称">
                                    </el-table-column>
                                    <el-table-column prop="brand" label="品牌">
                                    </el-table-column>
                                    <el-table-column prop="measurementUnit" label="规格" width="150">
                                    </el-table-column>
                                    <el-table-column prop="quantity" label="数量" width="100">
                                    </el-table-column>
                                    <el-table-column prop="valueDeclared" label="申报单价($)" width="130">
                                    </el-table-column>
                                </el-table>
                        </el-row>
                    </el-form>
                </div>
                <div class="weigh-panel" style="margin-top:10px;">
                    <el-form :model="editForm" :rules="rules" ref="editForm" status-icon label-width="80px">
                        <el-row>
                            <el-col :span="8">
                                <auth-keybord-copy v-model="editForm.actualWeight"></auth-keybord-copy>
                                <el-button style="margin: 10px 0; width: 100%; height: 50px" type="primary" size="large" :loading="editForm.loading" @click="submit">提交</el-button>
                            </el-col>
                            <el-col :span="16">
                                <el-row>
                                    <el-col :span="12">
                                        <el-form-item label="运费单价" prop="unitPrice">
                                            <weigh-item>${{editForm.unitPrice}}/LB</weigh-item>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="12">
                                        <el-form-item label="偏远附加">
                                            <el-input-number v-model="editForm.extendedAreaSurcharge" size="large" :min="0" :step="0.5" label="偏远附加"></el-input-number>
                                            <!-- <input-number :placeholder="'$ ' + editForm.extendedAreaSurcharge + '/LB'" :step="0.5" v-model="editForm.extendedAreaSurcharge"></input-number> -->
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="12">
                                        <el-form-item label="首磅附加">
                                            <weigh-item>${{editForm.poundSurcharge}}</weigh-item>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="12">
                                        <el-form-item label="物料费">
                                            <el-input-number v-model="editForm.materialCost" size="large" :min="0" :step="1" label="物料费"></el-input-number>
                                            <!-- <input-number :placeholder="'$ '+editForm.materialCost" :step="1" v-model="editForm.materialCost"></input-number> -->
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="12">
                                        <el-form-item label="附加保额" prop="coverage">
                                            <el-input-number v-model="editForm.coverage" size="large" :min="0" :step="50" label="附加保额"></el-input-number>
                                            <!-- <el-input placeholder="附加保额" v-model="editForm.coverage" size="large"></el-input> -->
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="12">
                                        <el-form-item label="保险费">
                                            <weigh-item>${{editForm.premium}}</weigh-item>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="12">
                                        <el-form-item label="实际重量" prop="actualWeight">
                                            <el-input placeholder="请输入实际重量" ref="weightInput" v-model="editForm.actualWeight" size="large"></el-input>
                                        </el-form-item>
                                    </el-col>
                    
                                    <el-col :span="12">
                                        <el-form-item label="计费重量">
                                            <weigh-item>{{editForm.chargeableWeight}}LB</weigh-item>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="12">
                                        <el-form-item label="未税标价">
                                            <weigh-item>${{count1}}</weigh-item>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="12">
                                        <el-form-item label="未税实收">
                                            <el-input placeholder="实收总额(不含关税)" v-model="editForm.amountWithoutTariff" size="large"></el-input>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="12">
                                        <el-form-item label="关税">
                                            <el-input-number v-model="editForm.tariff" :disabled="editForm.tariffType !== 1" size="large" :min="0" :step="1" label="物料费"></el-input-number>
                                            <!-- <input-number :disabled="editForm.tariffType !== 1" :placeholder="'$ '+editForm.tariff" :step="1" v-model="editForm.tariff"></input-number> -->
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="12">
                                        <el-form-item label="含税总额">
                                            <weigh-item>${{count}}</weigh-item>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </el-form>
                </div>
            </el-col>
        </el-row>
        <batch-weigh-order-dialog ref="batchWeighOrderDialog" :selectedLine="selectedLine"
        @after-submit="addOrders"/>
        <warning-tone ref="warningTone"></warning-tone>
    </div>
</template>
<script>
import { mapState } from 'vuex'
import AuthKeybordCopy from '~/components/AuthKeybordCopy'
import InputNumber from '~/components/InputNumber'
import { httpGet, httpPost } from '~/plugins/axios'
import { extend } from '~/plugins/tool'
import orderState from '~/mixins/orderState'
import tariffType from '~/mixins/tariffType'
import WeighItem from '~/components/WeighItem'
import WarningTone from '~/components/WarningTone'
import BatchWeighOrderDialog from '~/components/dialog/BatchWeighOrderDialog'

export default {
    components: { AuthKeybordCopy, InputNumber, WeighItem, WarningTone, BatchWeighOrderDialog },
    mixins: [orderState, tariffType],
    head: {
        title: '批量称重'
    },
    async asyncData () {
        const lines = (await httpGet(`/api/lines`)).list
        const branchPriceTypes = await httpGet(`/api/admin/branchpriceType/currentBranch`)
        const branchCustomPrice = await httpGet(`/api/admin/branchCustomPrice/currentBranch`)
        return { lines, branchPriceTypes, branchCustomPrice }
    },
    data () {
        return {
            searchForm: {
                orderNumber: '',
                loading: false
            },

            selectedLine: null,

            orderNumberList: [],

            selectedOrder: null,

            editForm: {
                unitPrice: 0,
                extendedAreaSurcharge: 0,
                actualWeight: '',
                chargeableWeight: 0,
                materialCost: 0,
                standardAmountWithoutTariff: 0,
                amountWithoutTariff: 0,
                tariff: 0,
                poundSurcharge: 0,
                totalAmount: 0,
                tariffType: '',
                coverage: 0,
                premium: 0,
                valueDeclaredRate: 0,
                startingWeight: 0
            },

            rules: {
                unitPrice: [
                    {
                        validator: (rule, value, callback) => {
                            const exp = /^([1-9][\d]{0,7}|0)(\.[\d]{1,2})?$/
                            if ((!exp.test(this.editForm.unitPrice)) || this.editForm.unitPrice <= 0 || !this.selectedPriceType) {
                                callback(new Error('请选择价格类型'))
                            } else {
                                callback()
                            }
                        },
                        trigger: 'submit'
                    }
                ],
                actualWeight: [
                    {
                        validator: (rule, value, callback) => {
                            const exp = /^([1-9][\d]{0,7}|0)(\.[\d]{1,2})?$/
                            if (!value) {
                                callback()
                            } else if ((!exp.test(value)) || value === '0' || value === 0) {
                                callback(new Error('实际重量必须为大于0，且最多2位小数'))
                            } else {
                                callback()
                            }
                        },
                        trigger: 'blur'
                    },
                    { required: true, message: '请输入实际重量', trigger: 'submit' }
                ],
                coverage: [
                    {
                        validator: (rule, value, callback) => {
                            const exp = /^\d+$/
                            if (!exp.test(value)) {
                                callback(new Error('附加保额必须为大于0的整数金额'))
                            } else {
                                callback()
                            }
                        },
                        trigger: 'blur'
                    }
                ]
            },

            priceTypes: [],
            selectedPriceType: null
        }
    },
    computed: {
        ...mapState('admin', ['currentBranch']),
        activeBranchPriceTypes () {
            const regularPrices = this.branchPriceTypes.filter(f => f.lineId === this.selectedLine)
            const customPrices = this.branchCustomPrice.filter(f => f.lineId === this.selectedLine)
            return [...regularPrices, ...customPrices]
        },
        count1 () {
            if (/^\d+$/.test(this.editForm.coverage)) {
                this.editForm.premium = (this.editForm.coverage * this.editForm.valueDeclaredRate).toFixed(2)
            } else {
                this.editForm.premium = 0
            }
            if (this.editForm.actualWeight < this.editForm.startingWeight) {
                this.editForm.chargeableWeight = this.editForm.startingWeight
            } else {
                this.editForm.chargeableWeight = this.editForm.actualWeight
            }
            this.editForm.standardAmountWithoutTariff = ((Number(this.editForm.unitPrice) + Number(this.editForm.extendedAreaSurcharge)) * Number(this.editForm.chargeableWeight)) + Number(this.editForm.poundSurcharge) + Number(this.editForm.materialCost) + Number(this.editForm.premium)
            this.editForm.standardAmountWithoutTariff = this.editForm.standardAmountWithoutTariff.toFixed(2)
            this.editForm.amountWithoutTariff = this.editForm.standardAmountWithoutTariff
            return this.editForm.standardAmountWithoutTariff
        },
        count () {
            this.editForm.totalAmount = (Number(this.editForm.amountWithoutTariff) + Number(this.editForm.tariff)).toFixed(2)
            return this.editForm.totalAmount
        },
        totalValueDeclared () {
            let price = 0
            for (const good of this.selectedOrder.orderGoods) {
                price += good.valueDeclared * (good.quantity || 1)
            }
            return price.toFixed(2)
        }
    },
    methods: {
        handleLineChange (val) {
            this.handleClose()
            const line = (this.lines.filter(f => f._id === val))[0]
            this.editForm.tariffType = line.tariffType
            this.editForm.valueDeclaredRate = line.valueDeclaredRate
            this.$nextTick(() => {
                this.$refs.searchInput.$el.getElementsByTagName('input')[0].focus()
            })
        },
        addOrders (newOrders) {
            const removeDuplicate = newOrders.filter(orderNumber => !this.orderNumberList.includes(orderNumber))
            const addedOrderNumberLists = removeDuplicate.map(order => order.orderNumber)
            this.orderNumberList = [...this.orderNumberList, ...addedOrderNumberLists]
            const newSelectedOrder = removeDuplicate[removeDuplicate.length - 1] || this.selectedOrder
            this.selectedOrder = newSelectedOrder
        },
        async queryOrder () {
            if (!this.searchForm.orderNumber) {
                return
            }
            try {
                const inputCopy = this.searchForm.orderNumber
                this.searchForm.orderNumber = ''
                this.searchForm.loading = true
                const result = await httpGet(`/api/admin/orders/weigh/${inputCopy}`)
                // smartExtend(this.editForm, result)
                // this.editForm.actualWeight = result.actualWeight ? result.actualWeight.toString() : ''
                this.$refs.warningTone.warningSuccess()
                if (result.line._id !== this.selectedLine) {
                    try {
                        await this.$alert('线路不符合', '错误', {
                            confirmButtonText: '好的',
                            type: 'error'
                        })
                    } catch (error) {
                        console.log(error)
                    }
                    return
                }
                if (result.state === 20) {
                    try {
                        await this.$alert(`该订单已称重，当前操作重新称重`, '提示', {
                            type: 'warning',
                            confirmButtonText: '确定'
                        })
                    } catch (error) {
                        console.log(error)
                        return
                    }
                }
                console.log(this.orderNumberList.indexOf(result.orderNumber))
                if (this.orderNumberList.indexOf(result.orderNumber) === -1) {
                    this.orderNumberList.push(result.orderNumber)
                }
                this.haldleSelectOrder(result)
            } catch (e) {
                this.$refs.warningTone.warningFail()
                this.$message.error(e.message)
            } finally {
                this.searchForm.loading = false
                this.$nextTick(() => {
                    this.$refs.searchInput.$el.getElementsByTagName('input')[0].focus()
                })
            }
        },
        handleDeleteOrder (orderNum) {
            this.orderNumberList.splice(this.orderNumberList.indexOf(orderNum), 1)
        },
        haldleSelectOrder (order) {
            this.selectedOrder = order
        },
        selectPriceType (priceType) {
            this.selectedPriceType = priceType
            extend(this.editForm, {
                unitPrice: priceType.unitPrice,
                poundSurcharge: priceType.poundSurcharge,
                startingWeight: priceType.startingWeight
            })
            this.$refs.weightInput.$el.getElementsByTagName('input')[0].focus()
        },
        handleClose () {
            this.orderNumberList = []
            this.selectedOrder = null
            // this.$refs.editForm.resetFields()
            this.editForm = {
                unitPrice: 0,
                extendedAreaSurcharge: 0,
                actualWeight: '',
                chargeableWeight: 0,
                materialCost: 0,
                standardAmountWithoutTariff: 0,
                amountWithoutTariff: 0,
                tariff: 0,
                poundSurcharge: 0,
                totalAmount: 0,
                tariffType: '',
                coverage: 0,
                premium: 0,
                valueDeclaredRate: 0,
                startingWeight: 0
            }
            this.selectedPriceType = null
        },
        submit () {
            this.$refs.editForm.validate(async (valid) => {
                if (valid) {
                    if (Number(this.editForm.actualWeight) >= 30) {
                        await this.$confirm('运单重量超过30磅，是否确定提交', '提示', {
                            confirmButtonText: '确定提交',
                            cancelButtonText: '取消',
                            type: 'warning'
                        })
                    }
                    if (this.editForm.state === 20) {
                        await this.$confirm('当前运单已经称重，请确认是否重新称重', '提示', {
                            confirmButtonText: '确定提交',
                            cancelButtonText: '取消',
                            type: 'warning'
                        })
                    }
                    try {
                        this.editForm.loading = true
                        const result = await httpPost(`/api/admin/orders/batchWeigh`, { orderNumberList: this.orderNumberList, editForm: this.editForm })
                        this.$areaAlert({
                            data: result,
                            key: 'orderNumber',
                            value: 'message'
                        })
                        this.handleClose()
                        this.selectedLine = null
                    } catch (e) {
                        this.$message.error(e.message)
                    } finally {
                        this.editForm.loading = false
                        this.$refs.searchInput.$el.getElementsByTagName('input')[0].focus()
                    }
                }
            })
        },
        async queryLines () {
            const { list } = await httpGet(`/api/lines`)
            this.lines = list
        },
        async queryBranchPriceType () {
            this.branchPriceTypes = await httpGet(`/api/admin/branchpriceType/currentBranch`)
        }
    },
    mounted () {
        this.queryLines()
        this.queryBranchPriceType()
    }
}
</script>
<style lang="less">
.weigh-panel {
    border: solid #eeeeee 1px;
    padding: 10px;

    .el-input-number {
        width: 100%;

        .el-input-number__decrease{
            right: 120px;
            width: 120px;
        }

        .el-input-number__increase {
            width: 120px;
        }
    }
}
</style>

<style lang="less" scope>
.el-message-box {

    .el-message-box__btns {
        text-align: center;

        .el-button {
            width: 45%;
            height: 45px;
        }
    }
}
.weigh-toolbar-item {
    float: right;
    min-width: 300px;
    font-size: 26px;
}

.weigh-toolbar-switch {
    float: right;
    margin-right: 10px;
}
</style>
