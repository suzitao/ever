<template>
    <div>
        <!-- 顶部工具栏 -->
        <div class="toolbar">
            <div>
                <el-radio-group class="toptool-left" v-model="activeTab" size="small" @change="handleChangeTab" v-if="$route.params.state === '-10-90'">
                    <el-radio-button v-for="tab in tabs" :label="tab.number" :key="tab.number">{{tab.name}}</el-radio-button>
                </el-radio-group>
                <el-input placeholder="扫描运单号" v-model="scanOrderInput" size="small" @keyup.enter.native="scanOrder(scanOrderInput)" v-if="$route.params.state === '10'" class="toptool-left" style="width: 400px">
                    <el-button @click="scanOrder(scanOrderInput)" slot="append">称重</el-button>
                </el-input>
                <el-input placeholder="运单号/国内运单号/收件人" v-model="searchFormInput.mixSearch" size="small" @keyup.enter.native="search" class="toptool-right" style="width:300px">
                    <el-button @click="search" slot="append" icon="el-icon-search"></el-button>
                </el-input>
                <el-button @click="handleMutipleSearch" size="small" class="toptool-right">高级检索</el-button>
                <el-button @click="queryList()" size="small" class="toptool-right">刷新</el-button>

            </div>
        </div>

        <!-- 列表 -->
        <el-table ref="table" :data="list" border @selection-change="handleSelectionChange" @sort-change="handleSortChange" @row-click="(row) => $refs.table.toggleRowSelection(row)" @row-dblclick="row => openUrl(`/admin/delivery/detail/${row._id}`)" v-loading="loading">
            <el-table-column type="selection" width="35" align='center'>
            </el-table-column>
            <el-table-column prop="orderNumber" label="运单号" width="104px" sortable="custom" show-overflow-tooltip>
                <template slot-scope="scope">
                    <nuxt-link target="_blank" :to="'/admin/delivery/detail/' + scope.row._id">{{scope.row.orderNumber}}</nuxt-link>
                </template>
            </el-table-column>
            <el-table-column prop="transhipmentExpressNumber" label="国内运单号" width="144px" sortable="custom" show-overflow-tooltip>
                <template slot-scope="scope">
                    <a target="_blank" :href="`https://www.kuaidi100.com/chaxun?nu=${scope.row.transhipmentExpressNumber}`">{{scope.row.transhipmentExpressNumber}}</a>
                </template>
            </el-table-column>
            <el-table-column prop="state" label="状态" width="75" sortable="custom">
                <template slot-scope="scope">
                    <order-state-tag :state="scope.row.state"/>
                </template>
            </el-table-column>
            <el-table-column prop="line" label="线路" width="63" sortable="custom" align='center' :formatter="row => row.line && row.line.lineNumber || ''">
            </el-table-column>
            <el-table-column prop="recipientName" label="收件人" min-width="80" show-overflow-tooltip sortable="custom">
                <template slot-scope="scope">
                    <div style="color:#67c23a" v-if="scope.row.recipientIdNumber&&scope.row.recipientIdCardPositiveImg&&scope.row.recipientIdCardBackImg">{{scope.row.recipientName}}</div>
                    <div style="color:#3a8ee6" v-if="scope.row.recipientIdNumber&&(!(scope.row.recipientIdCardPositiveImg&&scope.row.recipientIdCardBackImg))">{{scope.row.recipientName}}</div>
                    <div v-if="!(scope.row.recipientIdNumber)">{{scope.row.recipientName}}</div>
                </template>
            </el-table-column>
            <el-table-column prop="actualWeight" label="实重" min-width="115" sortable="custom" show-overflow-tooltip :formatter="row => row.actualWeight ? (row.actualWeight + 'LB/' + (row.actualWeight * 0.4536).toFixed(2) + 'KG') : ''">
            </el-table-column>
            <el-table-column prop="chargeableWeight" label="计重" min-width="115" sortable="custom" show-overflow-tooltip :formatter="row => row.chargeableWeight ? (row.chargeableWeight + 'LB/' + (row.chargeableWeight * 0.4536).toFixed(2) + 'KG') : ''">
            </el-table-column>
            <el-table-column prop="totalAmount" label="未税/关税/总额" min-width="135" sortable="custom" show-overflow-tooltip :formatter="orderListAmount">
            </el-table-column>
            <el-table-column prop="printTimes" label="打印" width="48" align='center' :formatter="row => row.printTimes + '次'">
            </el-table-column>
            <el-table-column :prop="timeCol" :label="timeLabel" width="120" sortable="custom"  :formatter="row => timeformate(row)">
            </el-table-column>
            <el-table-column prop="orderGoods" label="物品" min-width="200" show-overflow-tooltip :formatter="row => row.orderGoods.map(item => item.name + '(' + item.measurementUnit + ') * ' + item.quantity).join('/')">
            </el-table-column>
            <el-table-column prop="account" label="用户" width="110" sortable="custom" show-overflow-tooltip>
                <template slot-scope="scope">
                    <nuxt-link target="_blank" :to="'/admin/customer/-10-90/' + scope.row.account._id" v-if="$route.params.state !== '10'">{{scope.row.account.username}}</nuxt-link>
                    <nuxt-link target="_blank" :to="'/admin/customer/10/' + scope.row.account._id" v-if="$route.params.state === '10'">{{scope.row.account.username}}</nuxt-link>
                </template>
            </el-table-column>
        </el-table>

        <!-- 底部工具栏 -->
        <div class="toolbar" v-if="list.length > 0">
            <el-button @click="countOrder" size="small" :disabled="selectedList.length < 1">统计</el-button>
            <el-button @click="handleCancel" size="small" :disabled="selectedList.length < 1 || (stateIncluding(10) && stateIncluding(20))">取消订单</el-button>
            <el-button @click="$refs.addShipmentDetailDialog.handleEdit()" size="small" :disabled="selectedList.length < 1">添加运单跟踪项</el-button>
            <el-button @click="$refs.orderPrintDialog.handlePrint()" size="small" :disabled="selectedList.length < 1">打印</el-button>
            <el-button size="small" @click="scanOrder(selectedList[0].orderNumber)" v-if="$route.params.state === '10' || $route.params.state === '20'" :disabled="selectedList.length !== 1 || ( selectedList[0].state !== 10 && selectedList[0].state !== 20 )">称重</el-button>
            <el-button @click="$refs.storageDialog.handleEdit()" size="small" v-if="$route.params.state === '30' || $route.params.state === '-10-90'" :disabled="selectedList.length < 1 || (stateIncluding(30))">入库</el-button>
            <el-button @click="$refs.cancelStorageDialog.handleEdit()" size="small" v-if="$route.params.state === '-10-90'" :disabled="selectedList.length < 1 || (stateIncluding(40))">取消入库</el-button>
            <el-button @click="$refs.payDialog.handleEdit(0)" size="small" v-if="$route.params.state === '20' || $route.params.state === '-10-90'" :disabled="selectedList.length < 1 || (stateIncluding(20))">付款</el-button>
            <el-button @click="$refs.payDialog.handleEdit(1)" size="small" v-if="$route.params.state === '65' || $route.params.state === '-10-90'" :disabled="selectedList.length < 1 || (stateIncluding(65))">关税付款</el-button>
            <el-pagination class="pager-block" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNo" :page-sizes="pageSizes" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total" />
            <span class="selected">选中{{selectedList.length}}行</span>
        </div>

        <el-dialog title="高级检索" :visible.sync="searchFormInput.dialogVisible" :before-close="handleSearchFormClose" width="650px">
            <el-form size="small" :model="searchFormInput" :rules="searchFormRules" ref="searchFormInput" status-icon label-width="100px">
                <el-form-item label="运单号" prop="orderNumber">
                    <el-input v-model="searchFormInput.orderNumber"></el-input>
                </el-form-item>
                <el-form-item label="国内运单号" prop="transhipmentExpressNumber">
                    <el-input v-model="searchFormInput.transhipmentExpressNumber"></el-input>
                </el-form-item>
                <el-form-item label="收件人姓名" prop="recipientName">
                    <el-input v-model="searchFormInput.recipientName"></el-input>
                </el-form-item>
                <el-form-item label="收件人号码" prop="recipientCellphoneNumber">
                    <el-input v-model="searchFormInput.recipientCellphoneNumber"></el-input>
                </el-form-item>
                <el-form-item label="收件人证件" prop="recipientIdNumber">
                    <el-input v-model="searchFormInput.recipientIdNumber"></el-input>
                </el-form-item>
                <el-form-item label="下单时间" prop="createTime">
                    <el-date-picker v-model="searchFormInput.createTime" type="daterange" align="right" unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions"></el-date-picker>
                </el-form-item>
                <el-form-item label="称重时间" prop="weighTime">
                    <el-date-picker v-model="searchFormInput.weighTime" type="daterange" align="right" unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions"></el-date-picker>
                </el-form-item>
                <el-form-item label="线路" prop="line">
                    <el-select v-model="searchFormInput.line" placeholder="请选择">
                        <el-option v-for="item in lineList" :key="item.value" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="打印状态" prop="isPrinted">
                    <el-select v-model="searchFormInput.isPrinted" placeholder="请选择打印状态">
                        <el-option label="全部" value="">全部</el-option>
                        <el-option label="未打印" value="false">未打印</el-option>
                        <el-option label="已打印" value="true">已打印</el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="物品名称" prop="goodsName">
                    <el-input v-model="searchFormInput.goodsName"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleSearchFormSubmit" :loading="searchFormInput.loading">确定</el-button>
                    <el-button @click="handleSearchFormClose">取消</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
        <add-shipment-detail-dialog :orderList="selectedList" ref="addShipmentDetailDialog"/>
        <pay-dialog :orderList="selectedList" @after-submit="queryList()" ref="payDialog"/>
        <storage-dialog :orderList="selectedList" @after-submit="queryList()" ref="storageDialog"/>
        <cancel-storage-dialog :orderList="selectedList" @after-submit="queryList()" ref="cancelStorageDialog"/>
        <order-print-dialog :orderList="selectedList" source="admin" ref="orderPrintDialog"/>
    </div>
</template>
<script>
import pageMixins from '~/mixins/pageMixins-store'
import { httpGet, httpPost } from '~/plugins/axios'
import { countOrder, extend, smartExtend, formatDate, formateBoolean, orderListAmount, openUrl } from '~/plugins/tool'
import Idcard from '~/components/Idcard'
import AddShipmentDetailDialog from '~/components/dialog/AddShipmentDetailDialog'
import PayDialog from '~/components/dialog/PayDialog'
import StorageDialog from '~/components/dialog/StorageDialog'
import CancelStorageDialog from '~/components/dialog/CancelStorageDialog'
import OrderPrintDialog from '~/components/dialog/OrderPrintDialog'
import OrderStateTag from '~/components/tag/OrderStateTag'

export default {
    mixins: [pageMixins({
        keyFun: vm => `admin-order-state${vm.$route.params.state}`
    })],
    components: { Idcard, AddShipmentDetailDialog, PayDialog, StorageDialog, CancelStorageDialog, OrderPrintDialog, OrderStateTag },
    data () {
        return {
            activeTab: '-10-90',
            tabs: [
                { number: '-10-90', name: '全部' },
                { number: '20', name: '待过账' },
                { number: '30', name: '待入库' },
                { number: '40', name: '已入库' },
                { number: '50', name: '已发出' },
                { number: '60', name: '清关中' },
                { number: '65', name: '待付关税' },
                { number: '70', name: '派送中' },
                { number: '80', name: '已签收' }
            ],
            selectedList: [],

            scanOrderInput: '',

            // 高级检索的内容
            lineList: [{value: '', label: '全部'}],
            searchForm: {
                orderNumber: '',
                transhipmentExpressNumber: '',
                recipientName: '',
                recipientCellphoneNumber: '',
                recipientIdNumber: '',
                createTime: [null, null],
                weighTime: [null, null],
                line: '',
                isPrinted: '',
                goodsName: ''
            },
            searchFormInput: {
                orderNumber: '',
                transhipmentExpressNumber: '',
                recipientName: '',
                recipientCellphoneNumber: '',
                recipientIdNumber: '',
                createTime: [null, null],
                weighTime: [null, null],
                line: '',
                isPrinted: '',
                goodsName: '',

                loading: false,
                dialogVisible: false
            },
            searchFormRules: {},
            pickerOptions: {
                shortcuts: [{
                    text: '最近七天',
                    onClick (picker) {
                        const end = new Date()
                        const start = new Date()
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
                        picker.$emit('pick', [start, end])
                    }
                }, {
                    text: '最近十五天',
                    onClick (picker) {
                        const end = new Date()
                        const start = new Date()
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 15)
                        picker.$emit('pick', [start, end])
                    }
                }, {
                    text: '最近三十天',
                    onClick (picker) {
                        const end = new Date()
                        const start = new Date()
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
                        picker.$emit('pick', [start, end])
                    }
                }, {
                    text: '最近九十天',
                    onClick (picker) {
                        const end = new Date()
                        const start = new Date()
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
                        picker.$emit('pick', [start, end])
                    }
                }]
            }
        }
    },
    computed: {
        timeCol () {
            if (this.$route.params.state === '10') {
                return 'createTime'
            } else {
                return 'weighingTime'
            }
        },
        timeLabel () {
            if (this.$route.params.state === '10') {
                return '下单时间'
            } else {
                return '称重时间'
            }
        }
    },
    watch: {
        $route () {
            if (!this.$route.fullPath.endsWith('#top') && !this.$route.fullPath.endsWith('#bottom')) {
                this.queryList()
            }
        }
    },
    methods: {
        orderListAmount,
        formateBoolean,
        formatDate,
        openUrl,
        countOrder,
        timeformate (row) {
            if (this.$route.params.state === '10') {
                return row.createTime && formatDate(new Date(row.createTime), 'yy/MM/dd HH:mm')
            } else {
                return row.weighingTime && formatDate(new Date(row.weighingTime), 'yy/MM/dd HH:mm')
            }
        },
        handleChangeTab () {
            this.queryList()
        },
        scanOrder (orderNumber) {
            this.$router.push(`/admin/delivery/weigh/${orderNumber}`)
        },
        stateIncluding (state) {
            for (var index in this.selectedList) {
                if (this.selectedList[index].state !== state) {
                    return true
                }
            }
            return false
        },
        handleSelectionChange (val) {
            this.selectedList = val
        },
        async onQueryList (params) {
            let state = this.$route.params.state
            if (this.$route.params.state === '-10-90') {
                state = this.activeTab
            }
            extend(params, { state })
            // 高级检索的内容
            extend(params, {
                orderNumber: this.searchForm.orderNumber,
                transhipmentExpressNumber: this.searchForm.transhipmentExpressNumber,
                recipientName: this.searchForm.recipientName,
                recipientCellphoneNumber: this.searchForm.recipientCellphoneNumber,
                recipientIdNumber: this.searchForm.recipientIdNumber,
                line: this.searchForm.line,
                isPrinted: this.searchForm.isPrinted,
                goodsName: this.searchForm.goodsName
            })
            if (this.searchForm.weighTime && this.searchForm.weighTime[0] && this.searchForm.weighTime[1]) {
                extend(params, {
                    weighingTimeStart: this.searchForm.weighTime[0],
                    weighingTimeEnd: new Date(this.searchForm.weighTime[1].getTime() + (3600 * 1000 * 24))
                })
            }
            if (this.searchForm.createTime && this.searchForm.createTime[0] && this.searchForm.createTime[1]) {
                extend(params, {
                    createTimeStart: this.searchForm.createTime[0],
                    createTimeEnd: new Date(this.searchForm.createTime[1].getTime() + (3600 * 1000 * 24))
                })
            }
            return httpGet(`/api/admin/orders`, params)
        },
        async handleCancel () {
            await this.$confirm('取消后无法恢复，是否确认取消？', '提示', {
                confirmButtonText: '确认',
                cancelButtonText: '取消',
                type: 'warning'
            })
            try {
                this.loading = true
                const orderList = this.selectedList.map(item => item._id)
                const result = await httpPost(`/api/admin/orders/cancel`, {orderList})
                this.queryList()
                this.$alert(result)
            } catch (e) {
                this.loading = false
                this.$alert(`操作失败(${e.message})`)
            } finally {
            }
        },

        // 高级检索的内容
        handleMutipleSearch () {
            smartExtend(this.searchFormInput, this.searchForm)
            this.searchFormInput.dialogVisible = true
        },
        handleSearchFormClose () {
            // smartExtend(this.searchFormInput, this.searchForm) 好像没必要,先注释掉
            this.searchFormInput.dialogVisible = false
        },
        handleSearchFormSubmit () {
            this.searchFormInput.dialogVisible = false
            this.searchFormInput.mixSearch = ''
            smartExtend(this.searchForm, this.searchFormInput)
            this.queryList()
        },
        search () {
            this.searchForm = {
                mixSearch: '',
                orderNumber: '',
                transhipmentExpressNumber: '',
                recipientName: '',
                recipientCellphoneNumber: '',
                recipientIdNumber: '',
                createTime: [null, null],
                weighTime: [null, null],
                line: '',
                isPrinted: '',
                goodsName: ''
            }
            this.searchForm.mixSearch = this.searchFormInput.mixSearch
            this.queryList()
        },
        async initLinelist () {
            const { list } = await httpGet('/api/lines')
            this.lineList = this.lineList.concat(list.map(line => {
                return {value: line._id, label: line.name}
            }))
        }
    },
    mounted () {
        this.initLinelist()
        // if (!this.pageInfo) {
        this.queryList()
        // }
    }
}
</script>
