<template>
    <div>
        <!-- <div style="font-size:30px">账号: {{editForm.account && editForm.account.username}}</div> -->
        <div class="toolbar">
            <div>
                <div v-if="this.searchForm.onSearch && !searchForm.loading">
                    <div class="weigh-toolbar-item">
                        运单号: {{editForm.orderNumber}}
                    </div>
                    <div class="weigh-toolbar-item">
                        账号: {{editForm.account.username}}
                    </div>
                    <div class="weigh-toolbar-item">
                        线路: {{editForm.line.name}}[{{tariffType[editForm.tariffType]}}]
                    </div>
                </div>
                <div>
                    <el-input style="width: 400px" placeholder="扫描运单号" ref="searchInput" v-model="searchForm.orderNumber" size="small" @keyup.enter.native="queryOrder">
                        <el-button @click="queryOrder" slot="append" :loading="searchForm.loading">称重</el-button>
                    </el-input>
                </div>
            </div>
            <!-- <div style="margin-top:10px;display:flex;line-height:28px;">
                <el-radio-group v-model="clearance" size="mini">
                    <el-radio-button v-for="_clearance in clearanceList" :label="_clearance.value" :key="_clearance.value">{{_clearance.name}}</el-radio-button>
                </el-radio-group>
                <span v-if="clearance === 20 || clearance === 21">
                    <el-switch style="margin-left: 10px;margin-top:4px;" v-model="getExpressByGoldjet" active-text=" 同步获取快递单号"></el-switch>
                    <el-switch style="margin-left: 10px;margin-top:4px;" v-model="autoPrint" active-text="自动打印面单" :disabled="!getExpressByGoldjet"></el-switch>
                </span>
            </div> -->
        </div>
        <div v-if="this.searchForm.onSearch" class="weigh-panel">
            <el-form :model="editForm" :rules="rules" ref="editForm" status-icon label-width="80px">
                <el-row>
                    <el-col :span="8">
                        <el-form-item label="发货网点">
                            <weigh-item>{{editForm.branch.name}}</weigh-item>
                        </el-form-item>
                    </el-col>
                    <el-col :span="16">
                        <el-form-item label="收件地址">
                            <weigh-item>{{editForm.recipientAddress.join(' | ')}}</weigh-item>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="8">
                        <el-form-item label="申报总价">
                            <weigh-item>${{totalValueDeclared}}</weigh-item>
                        </el-form-item>
                        <el-form-item label="运费单价" prop="unitPrice">
                            <weigh-item>${{editForm.unitPrice}}/LB</weigh-item>
                        </el-form-item>
                    </el-col>
                    <el-col :span="16">
                        <el-form-item label="选择价格">
                            <div style="display:flex;flex-wrap: wrap;margin-top:-22px;">
                                <el-button style="margin-top:22px;" type="primary" size="large" :disabled="selectedPriceType && selectedPriceType._id === price._id" @click="selectPriceType(price)" v-for="price in editForm.priceTypes" :key="price._id">{{price.name}} ${{price.unitPrice}}</el-button>
                            </div>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="8">
                        <el-form-item label="偏远附加">
                            <el-input-number v-model="editForm.extendedAreaSurcharge" size="large" :min="0" :step="0.5" label="偏远附加"></el-input-number>
                            <!-- <input-number :placeholder="'$ ' + editForm.extendedAreaSurcharge + '/LB'" :step="0.5" v-model="editForm.extendedAreaSurcharge"></input-number> -->
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="首磅附加">
                            <weigh-item>${{editForm.poundSurcharge}}</weigh-item>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="物料费">
                            <el-input-number v-model="editForm.materialCost" size="large" :min="0" :step="1" label="物料费"></el-input-number>
                            <!-- <input-number :placeholder="'$ '+editForm.materialCost" :step="1" v-model="editForm.materialCost"></input-number> -->
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="8">
                        <el-form-item label="附加保额" prop="coverage">
                            <el-input-number v-model="editForm.coverage" size="large" :min="0" :step="50" label="附加保额"></el-input-number>
                            <!-- <el-input placeholder="附加保额" v-model="editForm.coverage" size="large"></el-input> -->
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="保险费">
                            <weigh-item>${{editForm.premium}}</weigh-item>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="未税标价">
                            <weigh-item>${{count1}}</weigh-item>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="8">
                        <el-form-item label="实际重量" prop="actualWeight">
                            <el-input placeholder="请输入实际重量" ref="weightInput" v-model="editForm.actualWeight" size="large"></el-input>
                        </el-form-item>
                    </el-col>
    
                    <el-col :span="8">
                        <el-form-item label="计费重量">
                            <weigh-item>{{editForm.chargeableWeight}}LB</weigh-item>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="未税实收">
                            <el-input placeholder="实收总额(不含关税)" v-model="editForm.amountWithoutTariff" size="large"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="8">
                        <auth-keybord-copy v-model="editForm.actualWeight"></auth-keybord-copy>
                        <el-button style="margin: 10px 0; width: 100%; height: 50px" type="primary" size="large" :loading="editForm.loading" @click="submit">提交</el-button>
                    </el-col>
                    <el-col :span="16">
                        <el-row>
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
                        <el-row>
                            <el-col :span="24" style="padding-left: 20px">
                                <el-table :data="editForm.orderGoods" border height="223">
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
                            </el-col>
                        </el-row>
                    </el-col>
                </el-row>
            </el-form>
        </div>
        <warning-tone ref="warningTone"></warning-tone>
    </div>
</template>
<script>
import AuthKeybordCopy from '~/components/AuthKeybordCopy'
import InputNumber from '~/components/InputNumber'
import { httpGet, httpPost } from '~/plugins/axios'
import { smartExtend, extend } from '~/plugins/tool'
import pageMixins from '~/mixins/pageMixins'
import orderState from '~/mixins/orderState'
import tariffType from '~/mixins/tariffType'
import WeighItem from '~/components/WeighItem'
import WarningTone from '~/components/WarningTone'

export default {
    components: { AuthKeybordCopy, InputNumber, WeighItem, WarningTone },
    mixins: [pageMixins(), orderState, tariffType],
    head: {
        title: '称重面板'
    },
    data () {
        return {
            searchForm: {
                onSearch: false,
                orderNumber: '',
                loading: false
            },

            editForm: {
                _id: '',
                state: '',
                orderNumber: '',
                account: '',
                line: '',
                branch: '',
                orderGoods: [],
                unitPrice: 0,
                extendedAreaSurcharge: 0,
                recipientAddress: [],
                actualWeight: '',
                chargeableWeight: 0,
                materialCost: 0,
                standardAmountWithoutTariff: 0,
                amountWithoutTariff: 0,
                tariff: 0,
                poundSurcharge: 0,
                totalAmount: 0,
                priceTypes: [],
                tariffType: '',
                coverage: 0,
                premium: 0,
                valueDeclaredRate: 0,
                defaultCoverage: 0,

                loading: false,
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

            clearanceList: [
                { value: 10, name: '普通' },
                { value: 20, name: 'DS' },
                { value: 21, name: 'G' }
            ],

            priceTypes: [],
            selectedPriceType: null,

            clearance: 10,
            getExpressByGoldjet: true,
            autoPrint: false
        }
    },
    computed: {
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
            for (const good of this.editForm.orderGoods) {
                price += good.valueDeclared * (good.quantity || 1)
            }
            return price.toFixed(2)
        }
    },

    methods: {
        async queryOrder () {
            if (!this.searchForm.orderNumber) {
                return
            }
            try {
                const inputCopy = this.searchForm.orderNumber
                this.searchForm.orderNumber = ''
                this.searchForm.onSearch = false
                this.searchForm.loading = true
                const result = await httpGet(`/api/admin/orders/weigh/${inputCopy}`)
                result.unitPrice = 0
                smartExtend(this.editForm, result)
                this.editForm.actualWeight = result.actualWeight ? result.actualWeight.toString() : ''
                this.$refs.warningTone.warningSuccess()
                this.searchForm.onSearch = true
                if (result.state === 20) {
                    await this.$alert(`该订单已称重，当前操作重新称重`, '提示', {
                        type: 'warning',
                        confirmButtonText: '确定'
                    })
                }
                this.$nextTick(() => {
                    this.$refs.weightInput.$el.getElementsByTagName('input')[0].focus()
                })
            } catch (e) {
                this.$refs.warningTone.warningFail()
                this.$message.error(e.message)
            } finally {
                this.searchForm.loading = false
            }
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
            this.$refs.editForm.resetFields()
            this.editForm = {
                _id: '',
                state: '',
                orderNumber: '',
                account: '',
                line: '',
                branch: '',
                orderGoods: [],
                unitPrice: 0,
                extendedAreaSurcharge: 0,
                recipientAddress: [],
                actualWeight: '',
                chargeableWeight: 0,
                materialCost: 0,
                standardAmountWithoutTariff: 0,
                amountWithoutTariff: 0,
                tariff: 0,
                poundSurcharge: 0,
                totalAmount: 0,
                priceTypes: [],
                tariffType: '',
                coverage: 0,
                premium: 0,
                valueDeclaredRate: 0,
                defaultCoverage: 0,

                loading: false,
                startingWeight: 0
            }
            this.searchForm.onSearch = false
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
                        this.editForm.clearance = this.clearance
                        this.editForm.getExpressByGoldjet = this.getExpressByGoldjet
                        const res = await httpPost(`/api/admin/orders/${this.editForm._id}/weigh`, this.editForm)
                        this.$message.success('操作成功')
                        if ((this.clearance === 20 || this.clearance === 21) && this.getExpressByGoldjet) {
                            if (!res.getExpressSuccess) {
                                this.$notify({
                                    title: '提交快递单失败',
                                    message: res.getExpressInfo,
                                    type: 'error'
                                })
                            } else if (this.autoPrint) {
                                window.open(`/orderPrint/size${this.clearance === 20 ? '3' : '4'}?orders=${this.editForm._id}&source=admin&autoPrint=true`)
                            } else {
                                this.$notify({
                                    title: '提交快递单成功',
                                    message: res.getExpressInfo,
                                    type: 'success'
                                })
                            }
                        }
                        this.handleClose()
                    } catch (e) {
                        this.$message.error(e.message)
                    } finally {
                        this.editForm.loading = false
                        this.$refs.searchInput.$el.getElementsByTagName('input')[0].focus()
                    }
                }
            })
        }
    },
    mounted () {
        this.$refs.searchInput.$el.getElementsByTagName('input')[0].focus()
        if (this.$route.params.orderNumber) {
            this.searchForm.orderNumber = this.$route.params.orderNumber
            this.queryOrder()
        }
    }
}
</script>
<style lang="less">
.weigh-panel {

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
