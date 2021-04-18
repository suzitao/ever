<template>
    <div class="home-order-detial">
        <div style="height:100px;width:300px;border:#eeeeee 1px solid;padding:10px;">
            <qr-code :value="'https://www.everfast.ca/orderSearch/' + order.orderNumber" :size="100" style="float:left;"></qr-code>
            <div style="float:right;width:190px;mergin-left:10px;text-align:center;">
                <img src="/logo/LOGO5.png"/>
                扫码查看物流跟踪信息
            </div>
        </div>
        <div class="order-panel">
            <div class="title">基本信息</div>
            <el-row>
                <el-col :span="8">
                    <detail-item label="运单号">{{order.orderNumber}}</detail-item>
                    <div class="grid-content bg-purple"></div>
                </el-col>
                <el-col :span="8">
                    <detail-item label="网点线路">{{order.branch.name}}/{{order.line.name}}</detail-item>
                    <div class="grid-content bg-purple"></div>
                </el-col>
                <el-col :span="8">
                    <detail-item label="状态"><order-state-tag :state="order.state"/></detail-item>
                    <div class="grid-content bg-purple"></div>
                </el-col>
            </el-row>
        </div>
        <div class="order-panel">
            <div class="title">发件人信息</div>
            <el-row>
                <el-col :span="8">
                    <detail-item label="发件人">{{order.senderName}}</detail-item>
                    <div class="grid-content bg-purple"></div>
                </el-col>
                <el-col :span="8">
                    <detail-item label="手机号码">{{order.senderCellphoneNumber}}</detail-item>
                    <div class="grid-content bg-purple"></div>
                </el-col>
                <el-col :span="8">
                    <detail-item label="身份证号">{{order.senderIdNumber}}</detail-item>
                    <div class="grid-content bg-purple"></div>
                </el-col>
            </el-row>
            <el-row>
                <detail-item label="发件地址">{{order.senderAddress.join(' ')}}</detail-item>
            </el-row>
        </div>
        <div class="order-panel">
            <div class="title">收件人信息</div>
            <el-row>
                <el-col :span="8">
                    <detail-item label="收件人">{{order.recipientName}}</detail-item>
                    <div class="grid-content bg-purple"></div>
                </el-col>
                <el-col :span="8">
                    <detail-item label="手机号码">{{order.recipientCellphoneNumber}}</detail-item>
                    <div class="grid-content bg-purple"></div>
                </el-col>
                <el-col :span="8">
                    <detail-item label="身份证号">{{order.recipientIdNumber}}</detail-item>
                    <div class="grid-content bg-purple"></div>
                </el-col>
            </el-row>
            <el-row>
                <detail-item label="收件地址">{{order.recipientAddress.join(' ')}}</detail-item>
            </el-row>
        </div>
        <div class="order-panel">
            <div class="title">物品信息</div>
            <el-table :data="order.orderGoods">
                <el-table-column prop="name" label="物品名称" width="180">
                </el-table-column>
                <el-table-column prop="brand" label="品牌">
                </el-table-column>
                <el-table-column prop="measurementUnit" label="规格">
                </el-table-column>
                <el-table-column prop="valueDeclared" label="申报单价">
                </el-table-column>
                <el-table-column prop="quantity" label="数量">
                </el-table-column>
                <el-table-column prop="valueDeclaredTotal" label="物品申报总价" :formatter="row => row.quantity * row.valueDeclared">
                </el-table-column>
            </el-table>
        </div>
        <div class="order-panel">
            <div class="title">备注</div>
            <el-row>
                <detail-item :labelVisible="false" lable-width="0">{{(order.remark || '无')}}</detail-item>
            </el-row>
        </div>
        <div class="order-panel" v-if="order.state != 10 && order.state != 90">
            <div class="title">重量信息</div>
            <el-row>
                <el-col :span="8">
                    <detail-item label="实际重量">{{order.actualWeight}} LB(磅)</detail-item>
                    <div class="grid-content bg-purple"></div>
                </el-col>
                <el-col :span="8">
                    <detail-item label="计费重量">{{order.chargeableWeight}} LB(磅)</detail-item>
                    <div class="grid-content bg-purple"></div>
                </el-col>
            </el-row>
        </div>
        <div class="order-panel" v-if="order.state != 10 && order.state != 90">
            <div class="title">费用信息</div>
            <el-row>
                <el-col :span="8">
                    <detail-item label="运费单价">Can$ {{order.unitPrice}} /LB(磅)</detail-item>
                    <div class="grid-content bg-purple"></div>
                </el-col>
                <el-col :span="8">
                    <detail-item label="首磅附加">Can$ {{order.poundSurcharge}}</detail-item>
                    <div class="grid-content bg-purple"></div>
                </el-col>
                <el-col :span="8">
                    <detail-item label="偏远附加">Can$ {{order.extendedAreaSurcharge}} /LB(磅)</detail-item>
                    <div class="grid-content bg-purple"></div>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="8">
                    <detail-item label="物料费">Can$ {{order.materialCost}}</detail-item>
                    <div class="grid-content bg-purple"></div>
                </el-col>
                <el-col :span="8">
                    <detail-item label="保险费">Can$ {{order.premium}}</detail-item>
                    <div class="grid-content bg-purple"></div>
                </el-col>
                <el-col :span="8">
                    <detail-item label="保险额度">Can$ {{order.coverage}}</detail-item>
                    <div class="grid-content bg-purple"></div>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="8">
                    <detail-item label="未含关税金额">$ {{order.amountWithoutTariff}}</detail-item>
                    <div class="grid-content bg-purple"></div>
                </el-col>
                <el-col :span="8" v-if="order.tariffType === 1 || order.tariffType === 2 || ( order.tariffType === 0 && (order.tariffState === 1 || order.tariffState === 3 ))">
                    <detail-item label="关税">$ {{order.tariff}}</detail-item>
                    <div class="grid-content bg-purple"></div>
                </el-col>
                <el-col :span="8" v-if="order.tariffType === 0 && order.tariffState === 2">
                    <detail-item label="关税">￥ {{order.tariffCNY}}</detail-item>
                    <div class="grid-content bg-purple"></div>
                </el-col>
                <el-col :span="8" v-if="order.tariffType === 1 || order.tariffType === 2 || ( order.tariffType === 0 && (order.tariffState === 1 || order.tariffState === 3 ))">
                    <detail-item label="含关税总金额">$ {{order.totalAmount}}</detail-item>
                    <div class="grid-content bg-purple"></div>
                </el-col>
            </el-row>
        </div>
        <div class="order-panel">
            <div class="title">运单跟踪信息</div>
            <el-table :data="ShipmentDetail" style="width: 100%" v-loading="shipmentDetailLoading">
                <el-table-column prop="createTime" label="时间" width="180" :formatter="formateCreateTime">
                </el-table-column>
                <el-table-column prop="information" label="信息">
                </el-table-column>
            </el-table>
        </div>
        <div class="order-panel" style="height: 40px">
            <el-button @click="handleCancel" style="float: right; margin-right: 20px" v-if="order.state === 10" :loading="cancelLoading">取消运单</el-button>
            <!--<el-button type="primary" style="float: right; margin-right: 20px" v-if="order.state === 20">付款</el-button>-->
        </div>
    </div>
</template>
<script>
import { mapState } from 'vuex'
import { httpGet, httpPost } from '~/plugins/axios'
// import { smartExtend } from '~/plugins/tool'
import { formatDate } from '~/plugins/tool'
import DetailItem from '~/components/DetailItem'
import OrderStateTag from '~/components/tag/OrderStateTag'
import QrCode from '~/components/QrCode'

export default {
    components: { DetailItem, OrderStateTag, QrCode },
    name: 'HomeOrderDetail',
    head: {
        title: '运单信息'
    },

    data () {
        return {
            label: '运单信息',
            ShipmentDetail: [],
            shipmentDetailLoading: true,
            cancelLoading: false
        }
    },

    computed: {
        ...mapState('home', {
            order (state) {
                return state.order[this.$route.params.id]
            }
        })
    },

    async fetch ({ store, params, error }) {
        try {
            await store.dispatch('home/getOrder', params.id)
        } catch (err) {
            error({ statusCode: 404, message: err.message })
        }
    },

    methods: {
        async queryShipmentDetail () {
            try {
                const { list } = await httpGet(`/api/shipmentDetail`, {orderId: this.$route.params.id})
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
                await httpPost(`/api/users/orders/${this.order._id}/cancel`)
                this.order.state = 90
            } catch (e) {
                this.$message.error(e.message)
            } finally {
                this.cancelLoading = false
            }
        },
        formateCreateTime (row) {
            return row.createTime && formatDate(new Date(row.createTime), 'yyyy/MM/dd HH:mm')
        }
    },

    mounted () {
        this.queryShipmentDetail()
    }
}
</script>
<style lang="less">
.home-order-detial {
    .order-panel {
        margin-top: 10px;

        .title {
            line-height: 20px;
            border-bottom: solid 2px #adadad;
            margin-bottom: 10px;
        }
    }
}
</style>