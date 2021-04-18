<template>
    <div>
        <div v-if="loading">{{loadingText}}</div>
        <div v-else class="main">
            <div class="order-box" v-for="order in orders" :key="order._id">
                <div class="order-content">
                    <div class="top">
                        <div class="top-left">
                            <img id="logoImg" src="/logo/LOGO5.png" @load="logoLoaded" class="logo" />
                            <p>everfast.ca</p>
                            <p style="margin-top: 1mm">{{order.branch.name}}</p>
                            <p style="margin-top: 1mm">{{order.createTime | formatDate('yyyy-MM-dd HH:mm')}}</p>
                        </div>
                        <div class="top-right">
                            <div class="lineNumber">{{order.line.lineNumber}}</div>
                            <p style="margin-top: 1mm;text-align: center;">{{order.line.name}}</p>
                        </div>
                    </div>
                    <div class="body">
                        <div class="item">
                            <div class="item-label">发件人/From:</div>
                            <div class="item-content" style="font-size: 20px;">{{order.senderName}}</div>
                        </div>
                        <div class="item">
                            <div class="item-label">号码/Tel:</div>
                            <div class="item-content">{{order.senderCellphoneNumber}}</div>
                        </div>
                        <div class="item">
                            <div class="item-label">地址/Address:</div>
                            <div class="item-content">{{order.senderAddress.slice(0, 2).join(' ')}}</div>
                        </div>
                        <div class="item">
                            {{order.senderAddress.slice(2).join(' ')}}
                        </div>
                        <div class="item">
                            <div class="item-label">国家/Country:</div>
                            <div class="item-content">Canada</div>
                        </div>
                    </div>
                    <div class="goods">
                        <div class="item">物品/Goods: {{order.orderGoods.map(item => item.name + '*' + item.quantity).join(' ')}}</div>
                        <div class="item">备注/Remarks: {{order.remark}}</div>
                    </div>
                    <div class="body">
                        <div class="item">
                            <div class="item-label">收件人/To:</div>
                            <div class="item-content" style="font-size: 20px;">{{order.recipientName}}</div>
                        </div>
                        <div class="item">
                            <div class="item-label">号码/Tel:</div>
                            <div class="item-content">{{order.recipientCellphoneNumber}}</div>
                        </div>
                        <div class="item">
                            <div class="item-label">地址/Address:</div>
                            <div class="item-content">{{order.recipientAddress.slice(0, 2).join(' ')}}</div>
                        </div>
                        <div class="item">{{order.recipientAddress.slice(2).join(' ')}}</div>
                        <div class="item">
                            <div class="item-label">国家/Country:</div>
                            <div class="item-content">China</div>
                        </div>
                    </div>
                    <div class="footer">
                        <barcode :value="order.orderNumber" :height="40" :width="2" :fontSize="30" :textMargin="-5" :displayValue="true"></barcode>
                    </div>
                </div>
                <div class="bottom">© 2017 Everfast Express Inc.</div>
            </div>
        </div>
    </div>
</template>
<script>
// import Vue from 'vue'
import { httpGet } from '~/plugins/axios'
import { formatDate } from '~/plugins/tool'
let res
const promise = new Promise((resolve, reject) => {
    res = resolve
})
export default {
    head: {
        title: '运单打印'
        // script: [ { src: 'http://localhost:8000/CLodopfuncs.js' } ]
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
    methods: {
        async logoLoaded () {
            res()
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
            if (this.$route.query.autoPrint === 'true') {
                await this.$nextTick()
                await promise
                // const LODOP = window.getCLodop()
                // LODOP.PRINT_INITA(0, 0, '4in', '7in', '面单格式1')
                // LODOP.SET_PRINT_PAGESIZE(1, '4in', '7in')
                // LODOP.SET_PRINT_MODE('POS_BASEON_PAPER', true)
                // LODOP.ADD_PRINT_HTML(0, 0, '101mm', '151.1mm', document.documentElement.innerHTML)
                // LODOP.PREVIEW()
                window.print()
                window.close()
            }
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
    .order-box {
        width: 97mm;
        height: 147mm;
        overflow: hidden;
        padding: 2mm;
        page-break-after: always;

        .order-content {
            border: 1px solid #000;

            .top {
                padding: 2mm;
                height: 29mm;
                border-bottom: 1px solid #000;

                .top-left {
                    display: inline-block;
                    width: 60mm;
                }

                .top-right {
                    display: inline-block;
                    width: 30mm;
                }

                .lineNumber {
                    height: 21mm;
                    border: 2mm solid #000;
                    font-size: 17mm;
                    font-weight: bold;
                    text-align: center;
                }

                .logo {
                    height: 14mm;
                }
            }

            .body {
                // font-size: 20px;
                padding: 2mm;
                height: 30mm;
                border-bottom: 1px solid #000;
                font-size: 4mm;
            }

            .goods {
                padding: 2mm;
                height: 18mm;
                font-size: 4mm;
                border-bottom: 1px solid #000;
            }

            .footer {
                // font-size: 20px;
                padding: 2mm;
                height: 17mm;
                text-align: center;
            }
        }

        .item + .item {
            margin-top: 1mm;
        }

        .item-label {
            display: inline-block;
            width: 44mm;
        }

        .item-content {
            display: inline-block;
            width: 44mm;
        }

        .bottom {
            height: 4mm;
            font-size: 8px;
            text-align: right;
        }
    }
}
span {
    font-weight: bold;
}
</style>
