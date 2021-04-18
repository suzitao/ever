<template>
    <div>
        <div v-if="loading">{{loadingText}}</div>
        <div v-else class="main">
            <div class="order-box" v-for="order in orders" :key="order._id">
                <div class="order-content-top">
                    <div class="body1">
                        {{order.transhipmentExpressDestcode}}
                    </div>
                    <div class="body2">
                        <div class="body2-left">
                            <barcode :value="order.transhipmentExpressNumber" :height="35" :width="1.5" :fontSize="13" :textMargin="0" :displayValue="true"></barcode>
                            <!-- <vue-barcode :value="order.transhipmentExpressNumber" :options="{ height: 50, width: 1.8, fontSize: 13, textMargin: 0 }"></vue-barcode> -->
                        </div>
                    </div>
                    <div class="body3">
                        收件人：{{order.recipientName}}<br/>
                        电话：{{order.recipientCellphoneNumber}}<br/>
                        地址：{{order.recipientAddress.join(' ')}}
                    </div>
                    <div class="body4">
                        <div class="body4-left">订单明细</div>
                        <div class="body4-middle">
                            发件人：{{order.senderName}}<br/>
                            电话：{{order.senderCellphoneNumber}}<br/>
                            地址：Canada {{order.senderAddress.join(' ')}}<br/><br/>
                            品名及件数：{{order.orderGoods.map(orderGoods => `${orderGoods.brand || ''}${orderGoods.name}(${orderGoods.measurementUnit})*${orderGoods.quantity}`).join('/')}}<br/><br/>
                            总重：{{(order.actualWeight * 0.4536).toFixed(2)}}KG&nbsp;&nbsp;&nbsp;
                            总数量：{{getSum(order.orderGoods, 'quantity')}}<br/>
                            总金额： 元
                        </div>
                        <div class="body4-right">
                            <div class="right-top">
                                <img id="goldjetLogoImg" src="/logo/goldjet-logo.png" @load="logoLoaded1" class="logo" />
                            </div>
                            <div class="right-buttom">
                                收件人签名：<br/><br/><br/><br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;年&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;日
                            </div>
                        </div>
                    </div>
                </div>
                <div class="order-content-bottom">
                    <div class="body5">
                        <div class="body5-left">
                            <img src="/logo/goldjet-logo.png" class="logo" />
                        </div>
                        <div class="body5-right">
                            <barcode :value="order.transhipmentExpressNumber" :height="30" :width="1.5" :fontSize="13" :textMargin="0" :displayValue="true"></barcode>
                        </div>
                    </div>
                    <div class="body6">
                        收件人：{{order.recipientName}}&nbsp;&nbsp;&nbsp;&nbsp;
                        电话：{{order.recipientCellphoneNumber}}<br/>
                        地址：{{order.recipientAddress.join(' ')}}
                    </div>
                    <div class="body7">
                        订单号：{{order.orderNumber}}&nbsp;&nbsp;&nbsp;&nbsp;
                        发件人：{{order.senderName}}&nbsp;&nbsp;&nbsp;&nbsp;
                        电话：{{order.senderCellphoneNumber}}<br/>
                        地址：Canada {{order.senderAddress.join(' ')}}
                    </div>
                    <div class="body8">
                        费用：&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        分拣代码：YTO<br/>
                        备注：
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
        padding: 2mm;
        page-break-after: always;

        .order-content-top {
            box-sizing: border-box;
            height: 88mm;
            border: 0.5mm solid #000;

            .body1 {
                box-sizing: border-box;
                height: 9mm;
                line-height: 9mm;
                font-size: 5.5mm;
                font-weight: bold;
                text-align: center;
                border-bottom: 0.5mm solid #000;
            }

            .body2 {
                box-sizing: border-box;
                height: 15mm;
                border-bottom: 0.5mm solid #000;
                display: flex;

                .body2-left {
                    box-sizing: border-box;
                    padding: 1mm;
                    height: 100%;
                    width: 63mm;
                    text-align: center;
                    border-right: 0.5mm solid #000;
                }
            }

            .body3 {
                box-sizing: border-box;
                padding: 1mm;
                height: 18.5mm;
                border-bottom: 0.5mm solid #000;
            }

            .body4 {
                box-sizing: border-box;
                height: 45mm;
                display: flex;

                .body4-left {
                    box-sizing: border-box;
                    display: inline-block;
                    width: 10mm;
                    height: 100%;
                    line-height: 10mm;
                    font-size: 6mm;
                    letter-spacing: 1mm;
                    text-align: center;
                    writing-mode: vertical-lr;
                    border-right: 0.3mm solid #000;
                }

                .body4-middle {
                    box-sizing: border-box;
                    width: 50mm;
                    height: 100%;
                    border-right: 0.3mm solid #000;
                }

                .body4-right {
                    box-sizing: border-box;
                    height: 100%;
                    width: 36mm;

                    .right-top {
                        box-sizing: border-box;
                        height: 18mm;
                        width: 100%;
                        padding: 4mm;
                        text-align: center;
                        border-bottom: 0.3mm solid #000;

                        .logo {
                            height: 10mm;
                        }
                    }

                    .right-buttom {
                        padding: 4mm 1mm;
                    }
                }
            }
        }

        .order-content-bottom {
            margin-top: 0.5mm;
            box-sizing: border-box;
            height: 56.5mm;
            border: 0.5mm solid #000;

            .body5 {
                box-sizing: border-box;
                height: 13mm;
                border-bottom: 0.5mm solid #000;
                display: flex;

                .body5-left {
                    box-sizing: border-box;
                    width: 40mm;
                    height: 100%;
                    padding: 1.5mm;
                    text-align: center;
                    border-right: 0.3mm solid #000;

                    .logo {
                        height: 10mm;
                    }
                }

                .body5-right {
                    box-sizing: border-box;
                    height: 100%;
                    width: 57mm;
                    padding: 0.5mm;
                    text-align: center;
                }
            }

            .body6 {
                box-sizing: border-box;
                height: 13mm;
                border-bottom: 0.5mm solid #000;
            }

            .body7 {
                box-sizing: border-box;
                height: 16mm;
                border-bottom: 0.5mm solid #000;
            }

            .body8 {
                box-sizing: border-box;
            }
        }
    }
}
</style>
