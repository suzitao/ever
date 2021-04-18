<template>
    <div class="home-order">
        <div class="toolbar-top">
            <el-input placeholder="运单号/国内运单号/收件人/手机号" v-model="searchFormInput.mixSearch" size="small" @keyup.enter.native="search" class="right" style="width:300px">
                <el-button @click="search" slot="append" icon="el-icon-search"></el-button>
            </el-input>
            <el-button @click="handleMutipleSearch" size="small" class="right">高级检索</el-button>
            <el-button @click="queryList()" size="small" class="right">刷新</el-button>
        </div>
        <el-tabs style="margin-top:5px;" v-model="activeName" @tab-click="handleTabClick">
            <el-tab-pane :label="tabTitle(state)" :name="state.name" v-for="state in tabs" :key="state.name"></el-tab-pane>
        </el-tabs>
        <div class="order-table">
            <el-table ref="table" :data="list" border v-loading="loading" @sort-change="handleSortChange" @selection-change="handleSelectionChange" @row-click="(row) => $refs.table.toggleRowSelection(row)" @row-dblclick="openOrder">
                <el-table-column type="selection" width="35px">
                </el-table-column>
                <el-table-column prop="orderNumber" label="运单号" width="104px" sortable="custom" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <nuxt-link target="_blank" v-if="scope.row.state !== 10" :to="'/home/order/' + scope.row._id">{{scope.row.orderNumber}}</nuxt-link>
                        <nuxt-link target="_blank" v-if="scope.row.state === 10" :to="'/home/orderEdit?type=EDIT&orderId=' + scope.row._id">{{scope.row.orderNumber}}</nuxt-link>
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
                <el-table-column prop="line" label="线路" width="63px" sortable="custom" align='center' :formatter="row => row.line && row.line.lineNumber || ''">
                </el-table-column>
                <el-table-column prop="chargeableWeight" label="重量" width="70px" sortable="custom" align='center'>
                </el-table-column>
                <el-table-column prop="recipientName" label="收件人" width="80px" sortable="custom" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <div style="color:#67c23a" v-if="scope.row.recipientIdNumber&&scope.row.recipientIdCardPositiveImg&&scope.row.recipientIdCardBackImg">{{scope.row.recipientName}}</div>
                        <div style="color:#3a8ee6" v-if="scope.row.recipientIdNumber&&(!(scope.row.recipientIdCardPositiveImg&&scope.row.recipientIdCardBackImg))">{{scope.row.recipientName}}</div>
                        <div v-if="!(scope.row.recipientIdNumber)">{{scope.row.recipientName}}</div>
                    </template>
                </el-table-column>
                <el-table-column prop="printTimes" label="打印" width="55px" align='center' :formatter="row => row.printTimes + '次'">
                </el-table-column>
                <el-table-column prop="totalAmount" label="费用" width="70px" sortable="custom" :formatter="row => (row.state >= 20 && row.state < 90) ? '$' + row.totalAmount : ''">
                </el-table-column>
                <el-table-column prop="createTime" label="下单时间" width="100px" sortable="custom" :formatter="row => row.createTime && formatDate(new Date(row.createTime), 'yyyy/MM/dd')">
                </el-table-column>
                <el-table-column prop="orderGoods" label="物品" show-overflow-tooltip :formatter="row => row.orderGoods.map(item => item.name + '(' + item.measurementUnit + ') * ' + item.quantity).join('/')">
                </el-table-column>
            </el-table>
        </div>
        <div class="toolbar">
            <el-button @click="$refs.orderPrintDialog.handlePrint()" size="small" :disabled="selectedList.length < 1">打印</el-button>
            <el-button @click="handleRestore" size="small" :disabled="selectedList.length < 1 || (stateIncluding(90))">恢复订单</el-button>
            <el-button @click="handleCancel" size="small" :disabled="selectedList.length < 1 || (stateIncluding(10))">取消订单</el-button>
            <el-button @click="copyOrder" size="small" :disabled="selectedList.length !== 1" v-if="activeName == 'SH'">复制</el-button>
            <el-button @click="exportSelectedToExcel('form6', '运单')" :disabled="selectedList.length < 1" size="small" :loading="generatingXlsx">导出Excel</el-button>
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
        <order-print-dialog :orderList="selectedList" source="user" ref="orderPrintDialog"/>
    </div>
</template>
<script>
import pageMixins from '~/mixins/pageMixins'
import { httpGet, httpPost, httpPostBlob } from '~/plugins/axios'
import { extend, formatDate, smartExtend, orderListAmount, downloadFile } from '~/plugins/tool'
import Idcard from '~/components/Idcard'
import OrderPrintDialog from '~/components/dialog/OrderPrintDialog'
import OrderStateTag from '~/components/tag/OrderStateTag'

export default {
    head: {
        title: '我的运单'
    },
    mixins: [pageMixins()],
    components: { Idcard, OrderPrintDialog, OrderStateTag },
    data () {
        return {
            generatingXlsx: false,
            label: '我的运单',
            tabs: [
                { name: 'SH', label: '待收货' },
                // 对应10
                // { name: 'FK', label: '待付款' },
                // 对应20/65
                { name: 'DF', label: '待发货' },
                // 对应20/30/40
                { name: 'YF', label: '已发货' },
                // 对应50/60/65
                { name: 'PS', label: '派送中' },
                // 对应70
                { name: 'QS', label: '已签收' },
                // 对应80
                { name: 'QB', label: '全部运单' },
                // 对应<90
                { name: 'QX', label: '已取消' }
                // 对应90
            ],
            activeName: 'SH',
            selectedList: [],

            stat: {},
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
            async exportSelectedToExcel (form, name) {
                try {
                    this.generatingXlsx = true
                    const orderList = this.selectedList.map(item => item._id)
                    const fileName = `${name}-${form}`
                    const response = await httpPostBlob(`/api/users/orders/getXlxsByOrderList/${form}/${fileName}`, {orderList})
                    const { data } = response
                    downloadFile(data, `${fileName}.xlsx`)
                } catch (error) {
                    console.log(error)
                } finally {
                    this.generatingXlsx = false
                }
            },
            searchFormRules: {},
            pickerOptions: {
                shortcuts: [{
                    text: '最近七天',
                    onClick (picker) {
                        const end = new Date(new Date(new Date().toLocaleDateString()).getTime())
                        const start = new Date(new Date(new Date().toLocaleDateString()).getTime())
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 6)
                        picker.$emit('pick', [start, end])
                    }
                }, {
                    text: '最近十五天',
                    onClick (picker) {
                        const end = new Date(new Date(new Date().toLocaleDateString()).getTime())
                        const start = new Date(new Date(new Date().toLocaleDateString()).getTime())
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 14)
                        picker.$emit('pick', [start, end])
                    }
                }, {
                    text: '最近三十天',
                    onClick (picker) {
                        const end = new Date(new Date(new Date().toLocaleDateString()).getTime())
                        const start = new Date(new Date(new Date().toLocaleDateString()).getTime())
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 29)
                        picker.$emit('pick', [start, end])
                    }
                }, {
                    text: '最近九十天',
                    onClick (picker) {
                        const end = new Date(new Date(new Date().toLocaleDateString()).getTime())
                        const start = new Date(new Date(new Date().toLocaleDateString()).getTime())
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 89)
                        picker.$emit('pick', [start, end])
                    }
                }]
            }
        }
    },
    methods: {
        orderListAmount,
        formatDate,
        tabTitle (tab) {
            if (this.stat[tab.name]) {
                return `${tab.label}(${this.stat[tab.name]})`
            }
            return tab.label
        },
        handleSelectionChange (val) {
            this.selectedList = val
        },
        stateIncluding (state) {
            for (var index in this.selectedList) {
                if (this.selectedList[index].state !== state) {
                    return true
                }
            }
            return false
        },
        onQueryList (params) {
            extend(params, { state: this.activeName })
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
            return this.$store.dispatch('home/getOrders', params)
        },
        handleTabClick (tab, event) {
            this.queryList()
        },
        async handleRestore () {
            try {
                this.loading = true
                const orderList = this.selectedList.map(item => item._id)
                const result = await httpPost(`/api/users/orders/restore`, {orderList})
                this.queryList()
                this.queryStat()
                this.$areaAlert({
                    data: result,
                    key: 'orderNumber',
                    value: 'message'
                })
            } catch (e) {
                this.loading = false
                this.$alert(`操作失败(${e.message})`)
            } finally {
            }
        },
        async handleCancel () {
            try {
                this.loading = true
                const orderList = this.selectedList.map(item => item._id)
                const result = await httpPost(`/api/users/orders/cancel`, {orderList})
                this.queryList()
                this.queryStat()
                this.$areaAlert({
                    data: result,
                    key: 'orderNumber',
                    value: 'message'
                })
            } catch (e) {
                this.loading = false
                this.$alert(`操作失败(${e.message})`)
            } finally {
            }
        },
        copyOrder () {
            const [order] = this.selectedList
            this.$router.push(`/home/orderEdit?type=ADDNEW&orderId=${order._id}`)
        },
        async queryStat () {
            this.stat = await httpGet('/api/users/orders/stat')
        },
        openOrder (row) {
            if (row.state !== 10) {
                this.$router.push('/home/order/' + row._id)
            } else {
                this.$router.push('/home/orderEdit?type=EDIT&orderId=' + row._id)
            }
        },
        addOrder () {
            this.$router.push('/home/orderEdit?type=ADDNEW')
        },
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
        this.queryList()
        this.queryStat()
        this.initLinelist()
    }
}
</script>
<style lang="less">
.el-loading-mask {
    z-index: 100;
}
</style>
