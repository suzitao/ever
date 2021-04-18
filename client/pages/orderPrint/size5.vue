<template>
    <div>
        <div v-if="loading">{{loadingText}}</div>
        <div v-else class="main">
            <div class="order-box" v-for="order in orders" :key="order._id">
                <div class="order-content">
                    <div class="top">
                        <img id="logoImg" src="/logo/just-move.jpg" @load="logoLoaded" class="logo" />
                        <div class="top-middle">
                            <barcode class="bar-code" :value="order.orderNumber" :height="30" :width="1.5" :fontSize="30" :textMargin="-5" :displayValue="false"></barcode>
                            <div class="order-number">运单编号/Tracking No：{{order.orderNumber}}</div>
                        </div>
                        <div class="top-right">
                            <div class="ch">集包地</div>
                            <div class="en">DISTRIBUTO</div>
                        </div>
                    </div>
                    <div class="body">
                        <div class="body-left">
                            <div>发货人信息</div>
                            <div>SHIPPER INFO.</div>
                        </div>
                        <div class="body-right">
                            <div class="name">发货人/shipper:{{order.senderName}}</div>
                            <div class="tel">电话/tel:{{order.senderCellphoneNumber}}</div>
                            <div>退件地址/package returning address:</div>
                            <div>{{order.senderAddress.join(' ')}}</div>
                        </div>
                    </div>
                    <div class="body">
                        <div class="body-left">
                            <div>收件人信息</div>
                            <div>RECEIVER INFO.</div>
                        </div>
                        <div class="body-right">
                            <div class="name">收件人/to:{{order.recipientName}}</div>
                            <div class="tel">电话/tel:{{order.recipientCellphoneNumber}}</div>
                            <div>收件地址/address:</div>
                            <div>{{order.recipientAddress.join(' ')}}</div>
                        </div>
                    </div>
                    <div class="blank" />
                    <div class="sign-container">
                        <div class="text">快件送到收件人地址，经收件人或收件人（寄件人）允许的代收人签名，视为送达。您的签名代表您已验收此包裹，并已确认商品信息无误，包装完好、没有划痕、没有破损等表面质量问题。</div>
                        <div class="sign-area">
                            <div>签收人/代签人：</div>
                            <div>SIGNATURE</div>
                            <div class="time">时间：</div>
                            <div>TIME</div>
                        </div>
                    </div>
                    <div class="barcode-container">
                        <div class="barcode-container-left">
                            <div>订单号/ORDER NO. : {{order.orderNumber}}</div>
                            <barcode class="barcode" :value="order.orderNumber" :height="30" :width="1.5" :fontSize="30" :textMargin="-5" :displayValue="false"></barcode>
                            <div>运单编号/Tracking No. : {{order.orderNumber}}</div>
                        </div>
                        <div class="barcode-container-middle">已签订安保协议<br>(天津)<br>【#打印序号】</div>
                        <div class="barcode-container-right">已验视</div>
                    </div>
                    <div class="body">
                        <div class="body-left">
                            <div>发货人信息</div>
                            <div>SHIPPER INFO.</div>
                        </div>
                        <div class="body-right">
                            <div class="name">发货人/shipper:{{order.senderName}}</div>
                            <div class="tel">电话/tel:{{order.senderCellphoneNumber}}</div>
                            <div>退件地址/package returning address:</div>
                            <div>{{order.senderAddress.join(' ')}}</div>
                        </div>
                    </div>
                    <div class="body">
                        <div class="body-left">
                            <div>收件人信息</div>
                            <div>RECEIVER INFO.</div>
                        </div>
                        <div class="body-right">
                            <div class="name">收件人/to:{{order.recipientName}}</div>
                            <div class="tel">电话/tel:{{order.recipientCellphoneNumber}}</div>
                            <div>收件地址/address:</div>
                            <div>{{order.recipientAddress.join(' ')}}</div>
                        </div>
                    </div>
                </div>
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
            // this.orders.forEach(item => {
            //     this.$set(item, 'recipientCellphoneNumber', `${item.recipientCellphoneNumber.substr(0, 3)}****${item.recipientCellphoneNumber.substr(7)}`)
            // })
            this.loading = false
            if (this.$route.query.autoPrint === 'true') {
                await this.$nextTick()
                await promise
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
        width: 101mm;
        height: 151mm;
        overflow: hidden;
        page-break-after: always;
        font-size: 12px;

        .order-content {

            .top {
                padding: 2mm 2mm 0;
                height: 20mm;
                border-bottom: 1px solid #000;

                .logo {
                    float: left;
                    height: 100%;
                }

                .top-middle {
                    float: left;
                    width: 55mm;
                    padding-top: 4mm;
                    text-align: center;

                    .order-number {
                        margin-top: 2mm;
                        text-align: center;
                    }
                }

                .top-right {
                    float: left;
                    width: 20mm;
                    text-align: center;
                    padding-top: 8mm;

                    .ch {
                        font-weight: bold;
                        font-size: 4mm;
                    }

                    .en {
                        margin-top: 1.6mm;
                    }
                }
            }

            .body {
                display: flex;
                height: 18mm;
                padding: 0 2mm;
                border-bottom: 1px solid #000;
                font-size: 3mm;

                .body-left {
                    padding: 2mm;
                    width: 16mm;
                    height: 14mm;
                    border-right: 1px solid #000;
                    text-align: center;
                }

                .body-right {
                    padding: 1mm;
                    width: 74mm;

                    .name {
                        float: left;
                        width: 37mm;
                    }

                    .tel {
                        float: left;
                        width: 37mm;
                    }
                }
            }

            .blank {
                height: 6mm;
                border-bottom: 1px solid #000;
            }

            .sign-container {
                display: flex;
                padding: 0 2mm;
                border-bottom: 1px solid #000;

                .text {
                    width: 58mm;
                    padding: 2mm;
                    border-right: 1px solid #000;
                }

                .sign-area {
                    padding: 1mm;
                    
                    .time {
                        margin-top: 3mm;
                    }
                }
            }

            .barcode-container {
                display: flex;
                padding: 0 2mm;
                border-bottom: 1px solid #000;

                .barcode-container-left {
                    padding: 2mm 0;
                    width: 55mm;

                    .barcode {
                        margin: 1mm 0;
                    }
                }

                .barcode-container-middle {
                    width: 25mm;
                    padding-top: 5mm;
                    text-align: center;
                }

                .barcode-container-right {
                    width: 20mm;
                    padding-top: 6mm;
                    font-size: 4mm;
                    font-weight: bold;
                    text-align: center;
                }
            }
        }
    }
}
span {
    font-weight: bold;
}
</style>
