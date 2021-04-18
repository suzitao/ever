<<template>
<div class="order-container">
        <div class="order-container">
            <el-breadcrumb separator="/" class="breadcrumb">
                <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
                <el-breadcrumb-item to="/orderSearch">运单查询</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="order-container-inner">
                <el-form size="small" :model="searchForm" :rules="rules" ref="searchForm" status-icon @submit.native.prevent>
                    <el-form-item prop="orderNumber">
                        <el-input type="textarea" v-model="searchForm.orderNumber" placeholder="可同时查询多个运单号，请以回车键隔开" :autosize="{ minRows: 5, maxRows: 10}"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="search" icon="el-icon-search">查询</el-button>
                    </el-form-item>
                </el-form>
                <el-tabs v-model="activeTab" type="border-card" closable @tab-remove="removeTab" v-if="result.length > 0">
                    <el-tab-pane :key="order.index" v-for="order in result" :label="order.orderNumber" :name="order.index">
                        <div class="none" v-if="order.shipmentDetail.length < 1">
                            抱歉！未查到此运单{{order.orderNumber}}信息，请确认运单号码是否正确，谢谢。
                        </div>
                        <div class="transhipment-express" v-if="order.state > 60 && order.state <= 90 && order.transhipmentExpressNumber">
                            本单已分配国内快递单号：{{order.transhipmentExpressCompany && order.transhipmentExpressCompany.name}}[{{order.transhipmentExpressNumber}}]
                        </div>
                        <div class="shipment-detail" :key="item._id" v-for="item in order.shipmentDetail">
                            <div class="time">{{item.createTime | formatTime}}</div>
                            <div class="information">{{item.information}}</div>
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </div>
        </div>
    </div>
</template>

<style lang="less" rel="stylesheet/less">
.order-container {
    .order-container {
        padding: 0px 10px;
        width: 1170px - 20px;
        margin: 0 auto;

        .breadcrumb {
            padding: 15px 0;
        }

        .order-container-inner {
            padding: 25px 25px;
            position: relative;
            min-height: 500px;
            border: solid 1px #eeeeee;

            .shipment-detail {
                margin-top: 20px;

                .none {
                    font-size: 14px;
                }

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
}
</style>

<script>
import { httpGet } from '~/plugins/axios'
// import { smartExtend } from '~/plugins/tool'
import { formatDate } from '~/plugins/tool'

export default {
    layout: 'index',
    name: 'orderSearch',
    head: {
        title: '运单跟踪'
    },

    filters: {
        formatTime: time => formatDate(new Date(time), 'yyyy/MM/dd HH:mm')
    },

    data () {
        return {
            activeTab: '0',
            searchForm: {
                // onSearch: false,
                orderNumber: ''
            },
            rules: {
                orderNumber: [
                    { required: true, message: '请输入查询的运单号', trigger: 'submit' }
                ]
            },
            result: []
        }
    },

    methods: {
        removeTab (targetName) {
            let activeName = this.activeTab
            if (activeName === targetName) {
                this.result.forEach((tab, index) => {
                    if (tab.index === targetName) {
                        let nextTab = this.result[index + 1] || this.result[index - 1]
                        if (nextTab) {
                            this.activeTab = nextTab.index
                        }
                    }
                })
            }
            this.result = this.result.filter(tab => tab.index !== targetName)
        },
        getOrderArray () {
            const reg = /\n(\n)*( )*(\n)*\n/g
            const oldArr = this.searchForm.orderNumber.replace(reg, '\n').split('\n')
            const res = []
            for (var i = 0; i < oldArr.length; i++) {
                if (oldArr[i].trim()) {
                    res.push(oldArr[i].trim())
                }
            }
            return res
        },
        search () {
            this.$refs.searchForm.validate(valid => {
                if (valid) {
                    this.queryOrder()
                }
            })
        },
        async queryOrder () {
            this.activeTab = '0'
            this.result = []
            const orderList = this.getOrderArray()
            for (const orderNumber of orderList) {
                try {
                    const { list, state, transhipmentExpressNumber, transhipmentExpressCompany } = await httpGet(`/api/shipmentDetail`, { orderNumber })
                    this.result.push({
                        orderNumber,
                        index: this.result.length.toString(),
                        shipmentDetail: list ? list.filter(item => !new RegExp('派送，快递单号').test(item.information)) : [],
                        state,
                        transhipmentExpressNumber,
                        transhipmentExpressCompany
                    })
                } catch (e) {
                    this.$message.error(e.message)
                } finally {
                }
            }
        }
    },
    mounted () {
        if (this.$route.params.orderNumber) {
            this.searchForm.orderNumber = this.$route.params.orderNumber
            this.queryOrder()
        }
    }
}
</script>
