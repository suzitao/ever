<template>
    <div class="mobile-search">
        <van-search show-action v-model="searchForm.orderNumber" @search="search" placeholder="请输入运单号查询">
            <div slot="action" @click="search">查询</div>
        </van-search>
        <div class="search-result" v-if="result.shipmentDetail">
            <div class="none" v-if="result.shipmentDetail.length < 1">
                抱歉！未查到此运单{{result.orderNumber}}信息，请确认运单号码是否正确，谢谢。
            </div>
            <div class="transhipment-express" v-if="result.state > 60 && result.state <= 90 && result.transhipmentExpressNumber">
                本单已分配国内快递单号：{{result.transhipmentExpressCompany && result.transhipmentExpressCompany.name}}[{{result.transhipmentExpressNumber}}]
            </div>
            <div class="shipment-detail" :key="item._id" v-for="item in result.shipmentDetail">
                <div class="time">{{item.createTime | formatTime}}</div>
                <div class="information">{{item.information}}</div>
            </div>
        </div>
    </div>
</template>

<style lang="less" rel="stylesheet/less">
.mobile-search {

    .search-result {
        padding: 12px;

        .shipment-detail {
            margin-top: 20px;

            .time {
                width: 120px;
                font-size: 13px;
                color: #999;
                float: right;
            }

            .information {
                font-size: 14px;
                padding-bottom: 5px;
                padding-left: 5px;
                border-bottom: 1px solid #d1dbe5;
            }
        }

        .transhipment-express {
            padding: 10px;
            border: 1px solid #92c8ff;
            background: #92c8ff40;
        }

        .none {
            padding: 10px;
            border: 1px solid #ff8787;
            background: #ff878745;
        }
    }
}
</style>

<script>
import { httpGet } from '~/plugins/axios'
// import { smartExtend } from '~/plugins/tool'
import { formatDate } from '~/plugins/tool'
export default {

    filters: {
        formatTime: time => formatDate(new Date(time), 'yyyy/MM/dd HH:mm')
    },

    data () {
        return {
            searchForm: {
                // onSearch: false,
                orderNumber: ''
            },
            result: {}
        }
    },

    methods: {
        search () {
            if (this.searchForm.orderNumber.trim()) {
                this.queryOrder()
            } else {
                this.$toast.fail('请输入运单号')
            }
        },
        async queryOrder () {
            this.$toast.loading({ duration: 0, forbidClick: true, message: '查询中' })
            this.result = {}
            try {
                const { list, state, transhipmentExpressNumber, transhipmentExpressCompany } = await httpGet(`/api/shipmentDetail`, { orderNumber: this.searchForm.orderNumber })
                this.result = {
                    shipmentDetail: list ? list.filter(item => !new RegExp('派送，快递单号').test(item.information)) : [],
                    state,
                    transhipmentExpressNumber,
                    transhipmentExpressCompany
                }
                this.$toast.clear()
            } catch (e) {
                this.$toast.fail(e.message)
            } finally {
            }
        }
    },
    mounted () {
        if (this.$route.query.orderNumber) {
            this.searchForm.orderNumber = this.$route.params.orderNumber
            this.queryOrder()
        }
    }
}
</script>
