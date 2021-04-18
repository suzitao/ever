<template>
    <div>
        <div v-if="loading">{{this.loadingText}}</div>
        <div v-else class="main">
            <div class="bill-box">
                <div class="bill-content">
                    <div class="top">
                        <el-row>
                            <el-col :span="12">
                                <img style="margin-left: 5mm" src="/logo/LOGO5.png" class="logo" />
                                <p style="font-size: 5mm; margin-left: 5mm; margin-top: 3mm">------everfast.ca------</p>
                            </el-col>
                            <el-col :span="12">
                                <p style="margin-top: 12mm">网点名称：<span>{{branch.name}}</span></p>
                                <p style="margin-top: 2mm">网点地址：<span>{{branch.address}}</span></p> 
                                <p style="margin-top: 2mm">联系电话：<span>{{branch.phoneNumber.join(', ')}}</span></p> 
                            </el-col>
                        </el-row>
                    </div>
                    <div class="body">
                        <el-row style="margin-top: 3mm">
                            <el-col :span="6">客户名称/Customer Name:</el-col>
                            <el-col :span="6"><span>{{account.realname}}</span></el-col>
                            <el-col :span="6">账号/Account:</el-col>
                            <el-col :span="6"><span>{{account.username}}</span></el-col>
                        </el-row>
                        <el-row style="margin-top: 2mm">
                            <el-col :span="6">电话/Tel:</el-col>
                            <el-col :span="6"><span>{{account.cellphoneNumber}}</span></el-col>
                            <el-col :span="6">邮箱/E-mail:</el-col>
                            <el-col :span="6"><span>{{account.email}}</span></el-col>
                        </el-row>
                    </div>
                    <div class="order-count">
                        运单数量：<span>{{orders.length}}</span>
                        实际重量合计：<span>{{getSum(orders, 'actualWeight').toFixed(2)}}LB</span>
                        收费重量合计：<span>{{getSum(orders, 'chargeableWeight').toFixed(2)}}LB</span>
                        未税金额合计：<span>${{getSum(orders, 'amountWithoutTariff').toFixed(2)}}</span>
                        预付关税合计：<span>${{getSum(orders.map(order => order.tariffType === 1 ? order.tariff : 0)).toFixed(2)}}</span>
                    </div>
                    <div class="order-content">
                        <div class="order">
                            <div class="col" style="width: 20mm"><span>运单号</span></div>
                            <div class="col" style="width: 15mm"><span>收件人</span></div>
                            <div class="col" style="width: 25mm"><span>电话号码</span></div>
                            <div class="col" style="width: 8mm"><span>线路</span></div>
                            <div class="col" style="width: 15mm"><span>实际重量</span></div>
                            <div class="col" style="width: 15mm"><span>收费重量</span></div>
                            <div class="col" style="width: 15mm"><span>未税金额</span></div>
                            <div class="col" style="width: 15mm"><span>预付关税</span></div>
                            <div class="col" style="width: 38mm; border-right:none"><span>物品信息</span></div>
                        </div>
                        <div class="order" v-for="order in orders" :key="order._id">
                            <div class="col" style="width: 20mm">{{order.orderNumber}}</div>
                            <div class="col" style="width: 15mm">{{order.recipientName}}</div>
                            <div class="col" style="width: 25mm">{{order.recipientCellphoneNumber}}</div>
                            <div class="col" style="width: 8mm">{{order.line.lineNumber}}</div>
                            <div class="col" style="width: 15mm">{{order.actualWeight}}LB</div>
                            <div class="col" style="width: 15mm">{{order.chargeableWeight}}LB</div>
                            <div class="col" style="width: 15mm">${{order.amountWithoutTariff}}</div>
                            <div class="col" style="width: 15mm">{{order.tariffType === 1 ? '$' + order.tariff : ''}}</div>
                            <div class="col" style="width: 38mm; border-right:none">{{order.orderGoods.map(item => item.name + '*' + item.quantity).join(' ')}}</div>
                        </div>
                    </div>
                    <div class="fotter">
                        <div style="float: left">
                            <span>此明细单不作为我司已收到表格内货物的凭证，所有包裹默认接受Everfast赔偿及免责条款，对于赔偿或免责条款请登录everfast.ca查询详细内容。</span>
                        </div>
                        <div style="float: right; margin-top: 8mm">
                            ---{{new Date() | formatDate('yyyy-MM-dd HH:mm')}}---
                        </div>
                        </div>
                </div>
                <div class="bottom">© 2017 Everfast Express Inc.</div>
            </div>
        </div>
    </div>
</template>
<script>
import { httpGet } from '~/plugins/axios'
import { getSum, formatDate } from '~/plugins/tool'

export default {
    head: {
        title: '运单打印'
    },
    components: {
        Barcode: () => import('~/components/Barcode.vue')
    },
    filters: { formatDate },
    methods: {
        getSum: getSum
    },
    data () {
        return {
            loading: true,
            loadingText: 'Loading...',
            branch: null,
            account: null,
            orders: []
        }
    },
    async mounted () {
        try {
            const ids = this.$route.query.orders ? this.$route.query.orders.split(',') : []
            const [ branch, account, orders ] = await Promise.all([
                httpGet('/api/admin/branchs/current'),
                httpGet('/api/admin/user/' + this.$route.query.account),
                httpGet('/api/admin/orders/printBill', { ids, account: this.$route.query.account })
            ])
            this.branch = branch
            this.account = account
            this.orders = orders
            this.loading = false
        } catch (e) {
            this.loadingText = e.message
        }
    }
}
</script>
<style lang="less" rel="stylesheet/less" scoped>

.bill-box {
    width: 216mm;
    overflow: hidden;
    padding: 5mm;
    page-break-after: always;
    box-sizing:border-box;

    .bill-content {
        border: 1px solid #000;

        .top {
            border-bottom: 1px solid #000;
            padding: 4mm;
            height: 30mm;
        }
        .body {
            border-bottom: 1px solid #000;
            padding: 4mm;
        }
        .order-count {
            border-bottom: 1px solid #000;
            padding: 4mm;
        }
        .order-content {

            .order {
                border-bottom: 1px solid #000;
                height: 12mm;

                .col {
                    border-right: 1px solid #000;
                    padding: 4mm 2mm;
                    height: 4mm;
                    float: left;
                    text-align: center;
                }
            }
        }
        .fotter {
            padding: 4mm;
            height: 20mm;
        }
    }
    
    .bottom {
        height: 4mm;
        font-size: 8px;
        text-align: right;
    }
}


span {
    font-weight: bold;
}
</style>
