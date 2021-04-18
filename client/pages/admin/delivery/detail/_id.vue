<template>
    <div>
        <div>
            <!-- <el-button style="float: right; margin-right: 50px" icon="arrow-left" size="small" @click="$router.go(-1)">返回</el-button> -->
            <div style="font-size: 20px; color: #989ba0; float: left; margin-right: 10px">运单号</div>
            <div style="font-size: 20px; color: #48576a; float: left; margin-right: 10px">{{order.orderNumber}}</div>
            <order-state-tag :state="order.state"/>
            <el-button size="small" style="margin-left:20px" @click="startEditing()"
            v-if="!isEditing&&canEdit">编辑</el-button>
            <el-button size="small" @click="isEditing=false" v-if="isEditing" 
            :disabled="isSaving" style="margin-left:20px">取消</el-button>
            <el-button size="small" v-if="isEditing" @click="handleSave()" :disabled="isSaving">保存</el-button>
            <div class="order-panel">
                <div class="title">基本信息</div>
                <el-row>
                    <el-col :span="3">
                        <detail-item label="运送线路">{{order.line && order.line.name || ''}}</detail-item>
                        <div class="grid-content bg-purple"></div>
                    </el-col>
                    <el-col :span="4">
                        <detail-item label="所属托盘">{{order.pallet && order.pallet.palletNumber || ''}}</detail-item>
                        <div class="grid-content bg-purple"></div>
                    </el-col>
                    <el-col :span="5">
                        <detail-item label="发货网点">{{order.branch && order.branch.name || ''}}</detail-item>
                        <div class="grid-content bg-purple"></div>
                    </el-col>
                    <el-col :span="4">
                        <detail-item label="客户账号">{{order.account && order.account.username || ''}}</detail-item>
                        <div class="grid-content bg-purple"></div>
                    </el-col>
                    <el-col :span="4">
                        <detail-item label="制单人">{{order.creator && order.creator.username || ''}}</detail-item>
                        <div class="grid-content bg-purple"></div>
                    </el-col>
                    <el-col :span="4">
                        <detail-item label="制单时间">{{order.createTime | formateTime}}</detail-item>
                        <div class="grid-content bg-purple"></div>
                    </el-col>
                </el-row>
            </div>
            <el-row :gutter="20">
                <el-col :span="12">
            <div class="order-panel" v-if="!isEditing">
                <div class="title">发件人信息</div>
                <el-row>
                    <el-col :span="6">
                        <detail-item label="发件人">{{order.senderName}}</detail-item>
                        <div class="grid-content bg-purple"></div>
                    </el-col>
                    <el-col :span="8">
                        <detail-item label="手机号码">{{order.senderCellphoneNumber}}</detail-item>
                        <div class="grid-content bg-purple"></div>
                    </el-col>
                    <el-col :span="10">
                        <detail-item label="证件号码">{{order.senderIdNumber}}</detail-item>
                        <div class="grid-content bg-purple"></div>
                    </el-col>
                </el-row>
                <el-row>
                    <detail-item label="发件地址">{{order.senderAddress.join(' ')}}</detail-item>
                </el-row>
            </div>
            <div class="order-panel" v-if="isEditing">
                <div class="title">发件人信息</div>
                <el-row>
                    <el-col :span="6">
                        <div class="form-label">发件人</div>
                        <el-input v-model="draft.senderName"></el-input>
                    </el-col>
                    <el-col :span="8">
                        <div class="form-label">手机号码</div>
                        <el-input v-model="draft.senderCellphoneNumber"></el-input>
                    </el-col>
                    <el-col :span="10">
                        <div class="form-label">证件号码</div>
                        <el-input v-model="draft.senderIdNumber"></el-input>
                    </el-col>
                </el-row>
                <el-row>
                    <div class="form-label">发件地址</div>
                    <el-input v-model="draft.senderAddress"></el-input>
                </el-row>
            </div>
            </el-col>
                <el-col :span="12">
            <div class="order-panel">
                <div class="title">
                <el-row>
                    <el-col :span="4">
                        收件人信息
                    </el-col>
                        <el-col :span="4" v-if="order.recipientIdCardPositiveImg&&order.recipientIdCardBackImg"><idcard v-model="order.recipientIdCardPositiveImg" :fileName="order.recipientName + order.recipientIdNumber + '(1)'">身份证正面</idcard></el-col>
                        <el-col :span="4" v-if="order.recipientIdCardPositiveImg&&order.recipientIdCardBackImg"><idcard v-model="order.recipientIdCardBackImg" :fileName="order.recipientName + order.recipientIdNumber + '(1)'">身份证北面</idcard></el-col>
                        <el-col :span="8" v-if="!(order.recipientIdCardPositiveImg&&order.recipientIdCardBackImg)&&order.recipientIdNumber"><font color="green">未上传身份证</font></el-col>
                        <el-col :span="6" v-if="!order.recipientIdNumber"><font color="red">未填写身份证号码</font></el-col>
                        <el-col :span="4" ><nuxt-link target="_blank" :to="'/admin/order/idCardUpload?recipientName=' + order.recipientName + '&recipientCellphoneNumber=' + order.recipientCellphoneNumber">上传证件</nuxt-link></el-col>
                </el-row>
                </div>
                <el-row v-if="!isEditing">
                    <el-col :span="6">
                        <detail-item label="收件人">{{order.recipientName}}</detail-item>
                        <div class="grid-content bg-purple"></div>
                    </el-col>
                    <el-col :span="8">
                        <detail-item label="手机号码">{{order.recipientCellphoneNumber}}</detail-item>
                        <div class="grid-content bg-purple"></div>
                    </el-col>
                    <el-col :span="10">
                        <detail-item label="证件号码">{{order.recipientIdNumber}}</detail-item>
                        <div class="grid-content bg-purple"></div>
                    </el-col>
                </el-row>
                <el-row v-if="!isEditing">
                    <detail-item label="收件地址">{{order.recipientAddress.join(' ')}}</detail-item>
                </el-row>
                <el-row v-if="isEditing">
                    <el-col :span="6">
                        <div class="form-label">收件人</div>
                        <el-input v-model="draft.recipientName"></el-input>
                    </el-col>
                    <el-col :span="8">
                        <div class="form-label">手机号码</div>
                        <el-input v-model="draft.recipientCellphoneNumber"></el-input>
                    </el-col>
                    <el-col :span="10">
                        <div class="form-label">证件号码</div>
                        <el-input v-model="draft.recipientIdNumber"></el-input>
                    </el-col>
                </el-row>
                <el-row v-if="isEditing">
                    <div class="form-label">收件地址</div>
                    <el-input v-model="draft.recipientAddress"></el-input>
                </el-row>

            </div>
            </el-col>
            </el-row>
            <div class="order-panel" v-if="!isEditing" style="width: 100%">
                <div class="title">物品信息</div>
                <el-table :data="order.orderGoods" border>
                    <el-table-column width="300px" prop="name" label="物品名称">
                    </el-table-column>
                    <el-table-column width="300px" prop="brand" label="品牌">
                    </el-table-column>
                    <el-table-column width="100px" prop="measurementUnit" label="规格">
                    </el-table-column>
                    <el-table-column width="200px" prop="valueDeclared" label="申报单价($)">
                    </el-table-column>
                    <el-table-column width="100px" prop="quantity" label="数量">
                    </el-table-column>
                    <el-table-column width="200px" prop="valueDeclaredTotal" label="申报总价($)" :formatter="row => row.quantity * row.valueDeclared">
                    </el-table-column>
                </el-table>
            </div>     
            <div class="order-panel" v-if="isEditing">
                <div class="title">物品信息editing</div>
                <el-table :data="draft.orderGoods" border>
                    <el-table-column width="300px" label="物品名称">
                        <template slot-scope="scope">
                            <el-input v-model="draft.orderGoods[scope.$index].name"></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column width="300px" label="品牌">
                        <template slot-scope="scope">
                            <el-input v-model="draft.orderGoods[scope.$index].brand"></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column width="100px" label="规格">
                        <template slot-scope="scope">
                            <el-input v-model="draft.orderGoods[scope.$index].measurementUnit"></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column width="200px" label="申报单价($)">
                        <template slot-scope="scope">
                            <el-input v-model="draft.orderGoods[scope.$index].valueDeclared"></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column width="100px" label="数量">
                        <template slot-scope="scope">
                            <el-input v-model="draft.orderGoods[scope.$index].quantity"></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column width="200px" label="申报总价($)" :formatter="row => row.quantity * row.valueDeclared">
                    </el-table-column>
                    <el-table-column width="100px" label="操作">
                        <template slot-scope="scope">
                            <el-button @click.native.prevent="deleteGoodsRow(scope.$index)" type="text">移除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <div style="margin-top:8px">
                    <el-button type="primary" size="mini" @click="addGoodsRow()">增加 + </el-button>
                </div>
            </div>     
            <div class="order-panel">
                <div class="title">其他信息</div>
                <el-row>
                    <el-col :span="4">
                        <detail-item label="转运公司">{{order.transhipmentExpressCompany && order.transhipmentExpressCompany.name || ''}}</detail-item>
                        <div class="grid-content bg-purple"></div>
                    </el-col>
                    <el-col :span="4">
                        <detail-item label="国内运单">
                            <a target="_blank" :href="`https://www.kuaidi100.com/chaxun?nu=${order.transhipmentExpressNumber}`">{{order.transhipmentExpressNumber}}</a>
                        </detail-item>
                        <div class="grid-content bg-purple"></div>
                    </el-col>
                    <el-col :span="16">
                        <detail-item label="备注">{{order.remark}}</detail-item>
                        <div class="grid-content bg-purple"></div>
                    </el-col>
                </el-row>
            </div>
            <div class="order-panel" v-if="order.state != 10 && order.state != 90">
                <div class="title">重量信息</div>
                <el-row>
                    <el-col :span="4">
                        <detail-item label="实际重量">{{order.actualWeight}} LB</detail-item>
                        <div class="grid-content bg-purple"></div>
                    </el-col>
                    <el-col :span="4">
                        <detail-item label="计费重量">{{order.chargeableWeight}} LB</detail-item>
                        <div class="grid-content bg-purple"></div>
                    </el-col>
                    <el-col :span="4">
                        <detail-item label="称重人">{{order.weighingOperator && order.weighingOperator.username || ''}}</detail-item>
                        <div class="grid-content bg-purple"></div>
                    </el-col>
                    <el-col :span="4">
                        <detail-item label="称重时间">{{order.weighingTime | formateTime}}</detail-item>
                        <div class="grid-content bg-purple"></div>
                    </el-col>
                </el-row>
            </div>
            <div class="order-panel" v-if="order.state != 10 && order.state != 90">
                <div class="title">费用信息</div>
                <el-row>
                    <el-col :span="4">
                        <detail-item label="运费单价">$ {{order.unitPrice}} /LB</detail-item>
                        <div class="grid-content bg-purple"></div>
                    </el-col>
                    <el-col :span="4">
                        <detail-item label="偏远附加">$ {{order.extendedAreaSurcharge}} /LB</detail-item>
                        <div class="grid-content bg-purple"></div>
                    </el-col>
                    <el-col :span="4">
                        <detail-item label="首磅附加">$ {{order.poundSurcharge}}</detail-item>
                        <div class="grid-content bg-purple"></div>
                    </el-col>
                    <el-col :span="4">
                        <detail-item label="物料费">$ {{order.materialCost}}</detail-item>
                        <div class="grid-content bg-purple"></div>
                    </el-col>
                    <el-col :span="4">
                        <detail-item label="保险费">$ {{order.premium}}</detail-item>
                    </el-col>
                    <el-col :span="4">
                        <detail-item label="保险额度">$ {{order.coverage}}</detail-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="4">
                        <detail-item label="关税CNY">¥ {{order.tariffCNY}}</detail-item>
                    </el-col>
                    <el-col :span="4">
                        <detail-item label="关税汇率">{{order.tariffExchangeRate}}</detail-item>
                    </el-col>
                    <el-col :span="4">
                        <detail-item label="关税CAD">$ {{order.tariff}}</detail-item>
                    </el-col>
                    <el-col :span="4">
                        <detail-item label="未税标价">$ {{order.standardAmountWithoutTariff}}</detail-item>
                    </el-col>
                    <el-col :span="4">
                        <detail-item label="未税实收">$ {{order.amountWithoutTariff}}</detail-item>
                        <div class="grid-content bg-purple"></div>
                    </el-col>
                    <el-col :span="4">
                        <detail-item label="含税实收">$ {{order.totalAmount}}</detail-item>
                        <div class="grid-content bg-purple"></div>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="4">
                        <detail-item label="运费操作">{{order.paymentOperator && order.paymentOperator.username || ''}}</detail-item>
                        <div class="grid-content bg-purple"></div>
                    </el-col>
                    <el-col :span="4">
                        <detail-item label="运费方式">{{order.paymentMethod}}</detail-item>
                        <div class="grid-content bg-purple"></div>
                    </el-col>
                    <el-col :span="4">
                        <detail-item label="运费时间">{{order.paymentTime | formateTime}}</detail-item>
                        <div class="grid-content bg-purple"></div>
                    </el-col>
                    <el-col :span="4">
                        <detail-item label="关税操作">{{order.tariffPaymentOperator && order.tariffPaymentOperator.username || ''}}</detail-item>
                        <div class="grid-content bg-purple"></div>
                    </el-col>
                    <el-col :span="4">
                        <detail-item label="关税方式">{{order.tariffPaymentMethod}}</detail-item>
                        <div class="grid-content bg-purple"></div>
                    </el-col>
                    <el-col :span="4">
                        <detail-item label="关税时间">{{order.tariffPaymentTime | formateTime}}</detail-item>
                        <div class="grid-content bg-purple"></div>
                    </el-col>
                </el-row>
            </div>
            <div class="order-panel">
                <div class="title">运单跟踪信息</div>
                <el-table :data="ShipmentDetail" border v-loading="shipmentDetailLoading">
                    <el-table-column prop="createTime" label="时间" width="250" :formatter="formateCreateTime">
                    </el-table-column>
                    <el-table-column prop="information" label="信息">
                    </el-table-column>
                </el-table>
            </div>
            <div class="order-panel" style="height: 40px">
                <el-button @click="handleCancel" style="float: right; margin-right: 20px" v-if="order.state === 10" :loading="cancelLoading">取消运单</el-button>
                <!-- <el-button type="primary" style="float: right; margin-right: 20px" v-if="order.state === 20">付款</el-button> -->
            </div>
        </div>
    </div>
</template>
<script>
import { httpGet, httpPost } from '~/plugins/axios'
import { formatDate } from '~/plugins/tool'
import DetailItem from '~/components/DetailItem'
import Idcard from '~/components/Idcard'
import OrderStateTag from '~/components/tag/OrderStateTag'

const formatAddress = address => {
    const replaceSpace = address.replace(/ {2,}/g, ' ')
    const result = replaceSpace.trim().split(' ')
    return result
}

export default {
    head: {
        title: '运单详情'
    },
    components: { DetailItem, Idcard, OrderStateTag },
    async asyncData ({ route, error }) {
        try {
            const order = await httpGet(`/api/admin/orders/${route.params.id}`)
            if (!order) {
                error({ statusCode: 404, message: '运单不存在' })
                return
            }
            const canEdit = [10, 20, 30, 40].includes(order.state)
            return { order, canEdit }
        } catch (e) {
            error({ statusCode: 404, message: e.message })
        }
    },
    data () {
        return {
            draft: {},
            isEditing: false,
            isSaving: false,
            ShipmentDetail: [],
            shipmentDetailLoading: true,
            cancelLoading: false
        }
    },
    filters: {
        formateTime (time) {
            return time && formatDate(new Date(time), 'yy/MM/dd HH:mm')
        }
    },
    methods: {
        async queryShipmentDetail () {
            try {
                const { list } = await httpGet(`/api/shipmentDetail`, { orderId: this.$route.params.id })
                this.ShipmentDetail = list
            } catch (e) {
                this.$message.error(e.message)
            } finally {
                this.shipmentDetailLoading = false
            }
        },
        async handleCancel () {
            try {
                this.cancelLoading = true
                await httpPost(`/api/admin/orders/${this.$route.params.id}/cancel`)
                this.order.state = 90
            } catch (e) {
                this.$message.error(e.message)
            } finally {
                this.cancelLoading = false
            }
        },
        formateCreateTime (row) {
            return row.createTime && formatDate(new Date(row.createTime), 'yy/MM/dd HH:mm')
        },
        deleteGoodsRow (index) {
            this.draft.orderGoods.splice(index, 1)
        },
        addGoodsRow () {
            this.draft.orderGoods.push({
                brand: '',
                measurementUnit: '',
                name: '',
                quantity: '',
                valueDeclared: '',
                saveGoods: false
            })
        },
        startEditing () {
            this.isEditing = true
            const {
                senderName,
                senderCellphoneNumber,
                senderIdNumber,
                senderAddress,
                recipientName,
                recipientCellphoneNumber,
                recipientIdNumber,
                recipientAddress,
                orderGoods
            } = this.order
            this.draft = {
                senderName,
                senderCellphoneNumber,
                senderIdNumber,
                senderAddress: senderAddress.join(' '),
                recipientName,
                recipientCellphoneNumber,
                recipientIdNumber,
                recipientAddress: recipientAddress.join(' '),
                orderGoods: [...orderGoods]
            }
        },
        async handleSave () {
            await this.$confirm('确认保存订单？', '提示', {
                confirmButtonText: '确认',
                cancelButtonText: '取消',
                type: 'warning'
            })
            try {
                this.isSaving = true
                const {senderAddress, recipientAddress} = this.draft
                const draftToSend = {
                    ...this.draft,
                    senderAddress: formatAddress(senderAddress),
                    recipientAddress: formatAddress(recipientAddress)
                }
                await httpPost(`/api/admin/orders/${this.$route.params.id}/edit`, draftToSend)
                this.order = await httpGet(`/api/admin/orders/${this.$route.params.id}`)
                this.$alert(`操作成功`)
            } catch (e) {
                this.$alert(`操作失败(${e.message})`)
            } finally {
                this.isEditing = false
                this.isSaving = false
            }
        }

    },

    mounted () {
        this.queryShipmentDetail()
    }
}
</script>
<style lang="less">
.order-panel {
    margin-top: 10px;

    .title {
        line-height: 20px;
        border-bottom: solid 2px #adadad;
        margin-bottom: 10px;
    }
}

.el-row {
    .el-input {
        width: 80%;
    }
}

.form-label {
    color: #989ba0;
    margin: 4px 0;
}

</style>
