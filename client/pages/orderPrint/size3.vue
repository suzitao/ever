<template>
    <div>
        <div v-if="loading">{{loadingText}}</div>
        <div v-else class="main">
            <div class="order-box" v-for="order in orders" :key="order._id">
                <div class="order-content">
                    <div class="body1">
                        {{order.transhipmentExpressDestcode}}
                    </div>
                    <div class="body2">
                        <barcode :value="order.transhipmentExpressNumber" :height="50" :width="1.8" :fontSize="13" :textMargin="0" :displayValue="true"></barcode>
                        <!-- <vue-barcode :value="order.transhipmentExpressNumber" :options="{ height: 50, width: 1.8, fontSize: 13, textMargin: 0 }"></vue-barcode> -->
                    </div>
                    <div class="body3">
                        <div class="body3-left">
                            <div class="receiver">
                                <div class="receiver-left">收件人</div>
                                <div class="receiver-right">
                                    收件人：{{order.recipientName}}<br/>
                                    电话：{{order.recipientCellphoneNumber}}<br/>
                                    地址：{{order.recipientAddress.join(' ')}}
                                </div>
                            </div>
                            <div class="sender">
                                <div class="sender-left">寄件人</div>
                                <div class="sender-right">
                                    发件人：Everfast<br/>
                                    电话：+1 6479782999<br/>
                                    地址：Suite 10, 4981 Highway 7 East, Markham, ON, L3R 1N1, Canada
                                </div>
                            </div>
                        </div>
                        <div class="body3-right">签收联</div>
                    </div>
                    <div class="body4">
                        <div class="body4-left">收件人/代收人：</div>
                        <div class="body4-right">
                            签收时间：<br/><br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;年&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;日
                        </div>
                    </div>
                    <div class="body5">
                        <img id="ytoLogoImg" src="/yto-logo.jpg" @load="logoLoaded1" class="logo" />
                        <img id="goldjetLogoImg" src="/logo/goldjet-logo.png" @load="logoLoaded2" class="logo" />
                        <barcode class="barcode" :value="order.transhipmentExpressNumber" :height="25" :width="1.6" :fontSize="13" :textMargin="0" :displayValue="true"></barcode>
                    </div>
                    <div class="body6">
                        <div class="body6-left">收件人</div>
                        <div class="body6-middle">
                            收件人：{{order.recipientName}}<br/>
                            电话：{{order.recipientCellphoneNumber}}<br/>
                            地址：{{order.recipientAddress.join(' ')}}
                        </div>
                        <div class="body6-right">收件联</div>
                    </div>
                    <div class="body7">
                        <div class="body7-left">订单详情</div>
                        <div class="body7-right">品名：{{order.orderGoods.map(orderGoods => `${orderGoods.brand || ''}${orderGoods.name}(${orderGoods.measurementUnit})*${orderGoods.quantity}`).join('/')}}</div>
                    </div>
                    <div class="body8">
                        <span>订单号：{{order.transhipmentExpressNumber}}</span>
                        <span class="float-right">数量：{{getSum(order.orderGoods, 'quantity')}}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
// import Vue from 'vue'
import { httpGet } from '~/plugins/axios'
import { formatDate, getSum } from '~/plugins/tool'
// import VueBarcode from '@xkeshi/vue-barcode'
let res1
const promise1 = new Promise((resolve, reject) => {
    res1 = resolve
})
let res2
const promise2 = new Promise((resolve, reject) => {
    res2 = resolve
})
export default {
    head: {
        title: '运单打印'
        // script: [ { src: 'http://localhost:8000/CLodopfuncs.js' } ]
    },
    components: {
        // VueBarcode
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
        getSum,
        async logoLoaded1 () {
            res1()
        },
        async logoLoaded2 () {
            res2()
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
                await promise1
                await promise2
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
    font-size: 3mm;

    .order-box {
        width: 97mm;
        height: 145mm;
        overflow: hidden;
        padding: 3mm 2mm;
        page-break-after: always;

        .order-content {
            border-top: 0.5mm dashed #000;

            .body1 {
                height: 11mm;
                line-height: 11mm;
                font-size: 5.5mm;
                font-weight: bold;
                text-align: center;
                border-bottom: 0.3mm dashed #000;
            }

            .body2 {
                padding: 0.8mm;
                height: 16.8mm;
                text-align: center;
                border-bottom: 0.3mm dashed #000;
            }

            .body3 {
                height: 47mm;
                border-bottom: 0.3mm dashed #000;

                .body3-left {
                    box-sizing: border-box;
                    display: inline-block;
                    width: 88.5mm;
                    height: 100%;
                    border-right: 0.3mm dashed #000;

                    .receiver {
                        box-sizing: border-box;
                        height: 28mm;
                        border-bottom: 0.3mm dashed #000;
                        display: flex;

                        .receiver-left {
                            box-sizing: border-box;
                            display: inline-block;
                            width: 6mm;
                            height: 100%;
                            line-height: 6mm;
                            letter-spacing: 1mm;
                            text-align: center;
                            writing-mode: vertical-lr;
                            border-right: 0.3mm dashed #000;
                        }

                        .receiver-right {
                            box-sizing: border-box;
                            display: inline-block;
                            width: 82mm;
                            height: 100%;
                            padding: 1mm;
                            line-height: 4mm;
                        }
                    }

                    .sender {
                        box-sizing: border-box;
                        height: 19mm;
                        display: flex;

                        .sender-left {
                            box-sizing: border-box;
                            display: inline-block;
                            width: 6mm;
                            height: 100%;
                            line-height: 6mm;
                            letter-spacing: 1mm;
                            text-align: center;
                            writing-mode: vertical-lr;
                            border-right: 0.3mm dashed #000;
                        }

                        .sender-right {
                            box-sizing: border-box;
                            display: inline-block;
                            width: 82mm;
                            height: 100%;
                            padding: 1mm;
                            line-height: 4mm;
                        }
                    }
                }

                .body3-right {
                    box-sizing: border-box;
                    display: inline-block;
                    height: 100%;
                    width: 8mm;
                    line-height: 8mm;
                    letter-spacing: 1mm;
                    text-align: center;
                    writing-mode: vertical-lr;
                }
            }

            .body4 {
                height: 13.8mm;
                border-bottom: 0.5mm dashed #000;
                display: flex;

                .body4-left {
                    box-sizing: border-box;
                    width: 48.3mm;
                    padding: 1mm;
                    border-right: 0.3mm dashed #000;
                }

                .body4-right {
                    box-sizing: border-box;
                    width: 48.3mm;
                    padding: 1mm;
                }
            }

            .body5 {
                height: 13mm;
                border-bottom: 0.3mm dashed #000;

                .logo {
                    box-sizing: border-box;
                    height: 100%;
                    padding: 2mm;
                }

                .barcode {
                    box-sizing: border-box;
                    float: right;
                    height: 100%;
                    padding: 1mm;
                }
            }

            .body6 {
                height: 16mm;
                border-bottom: 0.3mm dashed #000;
                display: flex;

                .body6-left {
                    box-sizing: border-box;
                    width: 6mm;
                    height: 100%;
                    line-height: 6mm;
                    letter-spacing: 1mm;
                    text-align: center;
                    writing-mode: vertical-lr;
                    border-right: 0.3mm dashed #000;
                }

                .body6-middle {
                    box-sizing: border-box;
                    width: 82.2mm;
                    height: 100%;
                    padding: 1mm;
                    font-size: 2mm;
                    line-height: 4mm;
                    border-right: 0.3mm dashed #000;
                }

                .body6-right {
                    box-sizing: border-box;
                    height: 100%;
                    width: 8mm;
                    line-height: 8mm;
                    letter-spacing: 1mm;
                    text-align: center;
                    writing-mode: vertical-lr;
                }
            }

            .body7 {
                height: 18mm;
                border-bottom: 0.3mm dashed #000;
                display: flex;

                .body7-left {
                    box-sizing: border-box;
                    width: 6mm;
                    height: 100%;
                    line-height: 6mm;
                    letter-spacing: 1mm;
                    text-align: center;
                    writing-mode: vertical-lr;
                    border-right: 0.3mm dashed #000;
                }

                .body7-right {
                    box-sizing: border-box;
                    width: 90mm;
                    height: 100%;
                    padding: 1mm;
                    font-size: 2mm;
                }
            }

            .body8 {
                height: 6mm;
                padding: 0 3mm;
                line-height: 6mm;
                border-bottom: 0.3mm dashed #000;
            }
        }
    }
}
</style>
