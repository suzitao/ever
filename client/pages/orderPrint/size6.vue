<template>
    <div>
        <div v-if="loading">{{loadingText}}</div>
        <div v-else class="main">
            <div class="letter-box" v-for="order in orders" :key="order._id">
                    <div class="order-box">
                        <div class="order-content">
                            <div class="top">
                                <div class="barcode">
                                    <barcode :value="order.orderNumber" :height="40" :width="2" :fontSize="18" :textMargin="-5" :displayValue="false"></barcode>
                                </div>
                                <div class="lineNumber">{{order.line.lineNumber}}</div>
                                <div class="orderNumber">{{order.orderNumber}}</div>
                            </div>
                            <div class="body">
                                <el-row>
                                    <el-col :span="12">账户/Account:</el-col>
                                    <el-col :span="12"><span>{{order.account.username}}</span></el-col>
                                </el-row>
                                <el-row style="margin-top: 1mm">
                                    <el-col :span="12">发件人/From:</el-col>
                                    <el-col :span="12"><span>{{order.senderName}}</span></el-col>
                                </el-row>
                                <el-row style="margin-top: 1mm">
                                    <el-col :span="12">收件人/To:</el-col>
                                    <el-col :span="12"><span>{{order.recipientName}}</span></el-col>
                                </el-row>
                                <el-row style="margin-top: 1mm">
                                    <el-col :span="12">号码/Tel:</el-col>
                                    <el-col :span="12"><span>{{order.recipientCellphoneNumber}}</span></el-col>                       
                                </el-row>
                            </div>
                            <div class="body">
                                物品/Goods: {{order.orderGoods.map(item => item.name + '*' + item.quantity).join(' ')}}
                            </div>
                        </div>
                        <div class="bottom">© 2017 Everfast Express Inc.</div>
                    </div>
            </div>
        </div>
    </div>
</template>
<script>
import { httpGet } from '~/plugins/axios'
import { formatDate } from '~/plugins/tool'

export default {
    head: {
        title: '运单打印'
    },
    components: {
        Barcode: () => import('~/components/Barcode.vue')
    },
    filters: { formatDate },
    data () {
        return {
            orders: [],
            loading: true,
            loadingText: 'Loading...'
        }
    },
    async mounted () {
        try {
            const ids = this.$route.query.orders ? this.$route.query.orders.split(',') : []
            this.orders = await httpGet(this.$route.query.source === 'admin' ? '/api/admin/orders/printOrder' : '/api/users/orders/printOrder', { ids })
            this.orders.forEach(item => {
                this.$set(item, 'recipientCellphoneNumber', `${item.recipientCellphoneNumber.substr(0, 3)}****${item.recipientCellphoneNumber.substr(7)}`)
            })
            this.loading = false
        } catch (e) {
            this.loadingText = e.message
        }
    }
}
</script>
<style lang="less" rel="stylesheet/less" scoped>
.main {
    // display: flex;
    // flex-direction: column;
    // align-items: center;
    // 影响自动换页
    .letter-box{
        // width: 279mm;
        // overflow: hidden;
        page-break-after: always;
        box-sizing: border-box;

        .order-box {
            width: 102mm;
            height: 50mm;
            padding: 2mm;
            box-sizing: border-box;

            .order-content {
                border: 1px dashed #000;
                width: 100%;
                height: 100% - 4mm;
                padding: 0 4px;
                box-sizing: border-box;

                .top {

                    .lineNumber {
                        width: 20mm;
                        height: 12mm;
                        font-size: 8mm;
                        color: #888;
                        font-weight: bold;
                        text-align: center;
                        box-sizing: border-box;
                        line-height: 12mm;
                    }

                    .orderNumber{
                        font-size: 10px;
                        letter-spacing: 12px;
                        font-weight: bold;
                        text-align: center;
                    }

                    .barcode {
                        float: right;
                    }
                }

                .body {
                    margin-top: 4px;
                    border-top: 1px dashed #000;
                    font-size: 12px;
                }
            }

            .bottom {
                width: 100%;
                height: 4mm;
                font-size: 8px;
                text-align: right;
            }
        }
    }
}
.el-col {
    font-size:12px;
    span {
        font-weight: bold;
    }
}
</style>
