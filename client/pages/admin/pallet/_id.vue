<template>
    <div style="min-height: 880%">
        <!-- 顶部工具栏 -->
        <div class="toolbar" style="height: 65px">
            <div style="float: right;width: 470px;">
                <el-row>
                    <el-input  class="toptool-right" style="width:247px;" placeholder="运单号/国内运单号/收件人" v-model="searchFormInput.mixSearch" size="small" @keyup.enter.native="search">
                        <el-button @click="search" slot="append" icon="el-icon-search"></el-button>
                    </el-input>
                    <el-button @click="handleMutipleSearch" size="small" class="toptool-right">高级检索</el-button>
                    <el-button @click="queryList()" size="small" class="toptool-right">刷新</el-button>
                </el-row>
                <el-row>
                    <el-input  class="toptool-right" style="width:403px;margin-top:5px" ref="addOrderInput" placeholder="扫描运单号添加" v-model="addOrderInput" size="small" v-if="pallet.state === 10" @keyup.enter.native="singleAddOrder">
                        <el-button @click="singleAddOrder" slot="append" :loading="addOrderloading">添加运单</el-button>
                    </el-input>
                    <el-radio-group class="toptool-right" style="margin-top:5px" v-model="activeTab" size="small" @change="queryList()" v-if="pallet.state !== 10">
                        <el-radio-button v-for="tab in tabs" :label="tab.number" :key="tab.number">{{tab.name}}</el-radio-button>
                    </el-radio-group>
                </el-row>
            </div>
            <div class="pallet-info">
                <div class="pallet-info-col pallet-info-col-before-col">
                    <span class="pallet-info-col-item"><span class="pallet-info-col-item-title-1">托盘编码</span>{{pallet.palletNumber}}</span>
                    <span class="pallet-info-col-item"><span class="pallet-info-col-item-title-1">归属网点</span>{{pallet.branch.name}}</span>
                    <span class="pallet-info-col-item"><span class="pallet-info-col-item-title-1">发运线路</span>{{pallet.lineList.map(item => item.lineNumber).join(' | ')}}</span>
                </div>
                <div class="pallet-info-col pallet-info-col-before-col">
                    <span class="pallet-info-col-item"><span class="pallet-info-col-item-title-1">托盘重量</span>{{pallet.weight}}LB/{{(pallet.weight*0.4536).toFixed(2)}}KG</span>
                    <span class="pallet-info-col-item"><span class="pallet-info-col-item-title-1">运单重量</span>{{pallet.orderActualWeight}}LB/{{(pallet.orderActualWeight*0.4536).toFixed(2)}}KG</span>
                    <span class="pallet-info-col-item"><span class="pallet-info-col-item-title-1">总重量</span>{{(Number(pallet.weight) + Number(pallet.orderActualWeight)).toFixed(2)}}LB/{{((Number(pallet.weight) + Number(pallet.orderActualWeight))*0.4536).toFixed(2)}}KG</span>
                </div>
                <div class="pallet-info-col pallet-info-col-before-col">
                    <span class="pallet-info-col-item"><span class="pallet-info-col-item-title-2">运费统计</span>${{pallet.orderFreight}}</span>
                    <span class="pallet-info-col-item"><span class="pallet-info-col-item-title-2">物料费统计</span>${{pallet.orderMaterialCost}}</span>
                    <span class="pallet-info-col-item"><span class="pallet-info-col-item-title-2">保险费统计</span>${{pallet.orderPremium}}</span>
                </div>
                <div class="pallet-info-col">
                    <span class="pallet-info-col-item"><span class="pallet-info-col-item-title-2">未税金额统计</span>${{pallet.orderAmountWithoutTariff}}</span>
                    <span class="pallet-info-col-item"><span class="pallet-info-col-item-title-2">预付关税统计</span>${{pallet.orderTariff}}</span>
                    <span class="pallet-info-col-item"><span class="pallet-info-col-item-title-2">后付关税统计</span>￥{{pallet.orderTariffCNY}}</span>
                </div>
            </div>
        </div>

        <!-- 列表 -->
        <el-table ref="table" :data="list" border @selection-change="handleSelectionChange" @sort-change="handleSortChange" @row-click="(row) => $refs.table.toggleRowSelection(row)" @row-dblclick="row => openUrl(`/admin/delivery/detail/${row._id}`)" v-loading="loading">
            <el-table-column type="selection" width="35px" align='center'>
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
            <el-table-column prop="line" label="线路" width="63px" sortable="custom" align='center' :formatter="row => row.line && row.line.lineNumber || ''">
            </el-table-column>
            <el-table-column prop="recipientName" label="收件人" min-width="80px" show-overflow-tooltip sortable="custom">
                <template slot-scope="scope">
                    <div style="color:#67c23a" v-if="scope.row.recipientIdNumber&&scope.row.recipientIdCardPositiveImg&&scope.row.recipientIdCardBackImg">{{scope.row.recipientName}}</div>
                    <div style="color:#3a8ee6" v-if="scope.row.recipientIdNumber&&(!(scope.row.recipientIdCardPositiveImg&&scope.row.recipientIdCardBackImg))">{{scope.row.recipientName}}</div>
                    <div v-if="!(scope.row.recipientIdNumber)">{{scope.row.recipientName}}</div>
                </template>
            </el-table-column>
            <el-table-column prop="actualWeight" label="实重" min-width="115px" sortable="custom" show-overflow-tooltip :formatter="row => row.actualWeight + 'LB/' + (row.actualWeight * 0.4536).toFixed(2) + 'KG'">
            </el-table-column>
            <el-table-column prop="chargeableWeight" label="计重" min-width="115px" sortable="custom" show-overflow-tooltip :formatter="row => row.chargeableWeight + 'LB/' + (row.chargeableWeight * 0.4536).toFixed(2) + 'KG'">
            </el-table-column>
            <el-table-column prop="totalAmount" label="未税/关税/总额" min-width="135px" sortable="custom" show-overflow-tooltip :formatter="orderListAmount">
            </el-table-column>
            <el-table-column prop="printTimes" label="打印" width="48px" align='center' :formatter="row => row.printTimes + '次'">
            </el-table-column>
            <el-table-column prop="weighingTime" label="称重时间" width="120px" sortable="custom" :formatter="row => row.weighingTime && formatDate(new Date(row.weighingTime), 'yy/MM/dd HH:mm')">
            </el-table-column>
            <el-table-column prop="orderGoods" label="物品" min-width="170px" show-overflow-tooltip :formatter="row => row.orderGoods.map(item => item.name + '(' + item.measurementUnit + ') * ' + item.quantity).join('/')">
            </el-table-column>
            <el-table-column prop="account" label="用户" width="110px" sortable="custom" show-overflow-tooltip :formatter="row => row.account && row.account.username || ''">
                <template slot-scope="scope">
                    <nuxt-link target="_blank" :to="'/admin/customer/-10-90/' + scope.row.account._id">{{scope.row.account.username}}</nuxt-link>
                </template>
            </el-table-column>
            <el-table-column label="操作" min-width="130px">
                <template slot-scope="scope">
                    <confirm-button type="text" tip="是否确认从托盘中移除" @confirm="removeOrder(scope.$index, scope.row)" v-if="pallet.state === 10">移除</confirm-button>
                    <el-button type="text" @click="handleTariffEdit(scope.$index, scope.row)" v-if="scope.row.state === 60 && scope.row.tariffType === 0 && scope.row.tariffState === 0">填写关税</el-button>
                    <el-button type="text" @click="noTariff(scope.row._id)" v-if="scope.row.state === 60 && scope.row.tariffType === 0 && scope.row.tariffState === 0">无关税</el-button>
                    <el-button type="text" @click="handleTariffEdit(scope.$index, scope.row)" v-if="scope.row.tariffType === 0 && (scope.row.state >= 60 && scope.row.state < 90) && (scope.row.tariffState !== 0 && scope.row.tariffState !== 3)">重填关税</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- EXCEL格式面板 -->
        <el-popover ref="exportPopover" placement="top-start" trigger="hover">
            <el-button type="primary" @click="exportAllToExcel({ ordersForm: 'form1', palletForm: 'form1', fileName: `托盘${pallet.palletNumber}(格式1)` })" size="mini">格式1</el-button>
            <el-button type="primary" @click="exportAllToExcel({ ordersForm: 'form2', palletForm: 'form1', fileName: `托盘${pallet.palletNumber}(格式2)` })" size="mini">格式2</el-button>
            <el-button type="primary" @click="exportAllToExcel({ ordersForm: 'form3', fileName: `托盘${pallet.palletNumber}(格式3)` })" size="mini">格式3</el-button>
            <el-button type="primary" @click="exportAllToExcel({ ordersForm: 'form4', fileName: `托盘${pallet.palletNumber}(格式4)` })" size="mini">格式4</el-button>
            <el-button type="primary" @click="exportAllToExcel({ ordersForm: 'form5', fileName: `托盘${pallet.palletNumber}(GJ-CC)` })" size="mini">GJ-CC</el-button>
        </el-popover>
        <!-- 身份证下载面板 -->
        <el-popover ref="dlIdCardPopover" placement="top-start" trigger="hover">
            <el-button type="primary" @click="handleDlIdCard" :disabled="selectedList.length === 0" size="mini">下载所选身份证</el-button>
            <el-button type="primary" @click="handleDlAllIdCard" size="mini">下载全部身份证</el-button>
            <el-button type="primary" @click="handleDlAllMergeIdCard()" size="mini">下载全部身份证（合成）</el-button>
            <el-button type="primary" @click="handleDlAllMergeIdCard({ photoName: 'B{transhipmentExpressNumber}s' })" size="mini">下载全部身份证（GJ格式）</el-button>
        </el-popover>
        <!-- 底部工具栏 -->
        <div class="toolbar toolbar-pager">
            <el-button @click="countOrder" size="small" :disabled="selectedList.length < 1">统计</el-button>
            <el-button v-popover:exportPopover size="small">导出EXCEL</el-button>
            <el-button v-popover:dlIdCardPopover size="small">下载身份证</el-button>
            <el-button @click="$refs.batchScanOrderDialog.handleEdit()" size="small" v-if="pallet.state === 10">批量装盘/移除</el-button>
            <el-button @click="batchDelete" size="small" :disabled="selectedList.length === 0" v-if="pallet.state === 10">移除所选</el-button>
            <el-button @click="$refs.addShipmentDetailDialog.handleEdit()" size="small" :disabled="selectedList.length < 1">添加运单跟踪项</el-button>
            <el-button @click="$refs.orderPrintDialog.handlePrint()" size="small" :disabled="selectedList.length < 1">打印</el-button>
            <el-button @click="$refs.updateOrderStateDialog.handleEdit(70)" size="small" :disabled="selectedList.length < 1">派送</el-button>
            <el-button @click="$refs.updateOrderStateDialog.handleEdit(80)" size="small" :disabled="selectedList.length < 1">签收</el-button>
            <el-pagination class="pager-block" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNo" :page-sizes="pageSizes" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total" />
            <span class="selected">选中{{selectedList.length}}行</span>
        </div>
        <el-dialog title="关税填写" v-model="tariffEditForm.dialogVisible" :before-close="handleTariffClose">
            <el-form :inline="true" :model="tariffEditForm" label-width="80px" :rules="tariffRules" ref="tariffEditForm" status-icon>
                <el-form-item label="税额(CNY)" prop="tariffCNY">
                    <el-input v-model="tariffEditForm.tariffCNY"></el-input>
                </el-form-item>
                <el-form-item label="当前税率" prop="exchangeRate">
                    <el-input v-model="tariffEditForm.exchangeRate" :disabled="true"></el-input>
                </el-form-item>
                <el-form-item label="预计税额(CAD)" prop="tariff">
                    <el-input :disabled="true"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="tariffSubmit" :loading="tariffEditForm.loading">提交</el-button>
                <el-button @click="noTariff(tariffEditForm._id)" :loading="tariffEditForm.loading" v-if="tariffEditForm.tariffType === 0 && (tariffEditForm.state >= 60 && tariffEditForm.state < 90) && (tariffEditForm.tariffState !== 0 && tariffEditForm.tariffState !== 3)">无关税</el-button>
                <el-button @click="handleTariffClose">取消</el-button>
            </div>
        </el-dialog>

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
        <order-print-dialog :orderList="selectedList" source="admin" ref="orderPrintDialog"/>
        <batch-scan-order-dialog :palletId="pallet._id" @after-submit="queryList()" ref="batchScanOrderDialog"/>
        <update-order-state-dialog :orderList="selectedList" @after-submit="queryList()" ref="updateOrderStateDialog"/>
        <warning-tone ref="warningTone"></warning-tone>
    </div>
</template>

<script>
import { httpGet, httpPost } from '~/plugins/axios'
import { countOrder, smartExtend, extend, formatDate, formateBoolean, orderListAmount, openUrl } from '~/plugins/tool'
import pageMixins from '~/mixins/pageMixins'
import ConfirmButton from '~/components/ConfirmButton'
import Idcard from '~/components/Idcard'
import AddShipmentDetailDialog from '~/components/dialog/AddShipmentDetailDialog'
import WarningTone from '~/components/WarningTone'
import OrderPrintDialog from '~/components/dialog/OrderPrintDialog'
import BatchScanOrderDialog from '~/components/dialog/BatchScanOrderDialog'
import OrderStateTag from '~/components/tag/OrderStateTag'
import UpdateOrderStateDialog from '~/components/dialog/UpdateOrderStateDialog'

export default {
    mixins: [pageMixins()],
    components: { ConfirmButton, Idcard, WarningTone, AddShipmentDetailDialog, OrderPrintDialog, BatchScanOrderDialog, OrderStateTag, UpdateOrderStateDialog },
    data () {
        return {
            activeTab: 'ALL',
            tabs: [
                { number: 'ALL', name: '全部' },
                { number: '50', name: '已发出' },
                { number: '60', name: '清关中' },
                { number: '65', name: '待付关税' },
                { number: '70', name: '派送中' },
                { number: '80', name: '已签收' }
            ],
            tariffEditForm: {
                _id: '',
                tariff: '',
                tariffCNY: '',
                tariffState: '',
                tariffType: '',
                state: '',

                loading: false,
                dialogVisible: false
            },

            tariffRules: {

            },

            addOrderInput: '',
            addOrderloading: false,

            selectedList: [],

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
                _orderNumber: '',
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
                    text: '最近一周',
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
                    text: '最近一个月',
                    onClick (picker) {
                        const end = new Date()
                        const start = new Date()
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
                        picker.$emit('pick', [start, end])
                    }
                }, {
                    text: '最近三个月',
                    onClick (picker) {
                        const end = new Date()
                        const start = new Date()
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
                        picker.$emit('pick', [start, end])
                    }
                }, {
                    text: '最近半年',
                    onClick (picker) {
                        const end = new Date()
                        const start = new Date()
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 182)
                        picker.$emit('pick', [start, end])
                    }
                }]
            }
        }
    },
    async asyncData ({ route, error }) {
        try {
            const pallet = await httpGet(`/api/admin/pallet/${route.params.id}`)
            if (!pallet) {
                return error({ statusCode: 404, message: '托盘不存在' })
            }
            return { pallet }
        } catch (e) {
            error({ statusCode: 404, message: e.message })
        }
    },
    methods: {
        orderListAmount,
        formateBoolean,
        formatDate,
        openUrl,
        countOrder,
        async batchDelete () {
            await this.$confirm('是否确认从托盘中移除所选运单?')
            try {
                this.loading = true
                const orderNumbers = this.selectedList.map(order => order.orderNumber)
                const result = await httpPost(`/api/admin/orders/batchSetPallet`, { orderNumbers, palletId: this.pallet._id, type: '1' })
                await this.queryList()
                this.$areaAlert({
                    data: result,
                    key: 'orderNumber',
                    value: 'message'
                })
            } catch (e) {
                this.$alert(e.message)
                this.loading = false
            } finally {
            }
        },
        batchScan () {
            this.$refs.batchPalletDialog.open(this.pallet._id)
        },
        async exportAllToExcel ({ ordersForm = '', palletForm = '', fileName = '' }) {
            window.location.href = `/api/admin/orders/getXlxsByPallet/${this.pallet._id}?ordersForm=${ordersForm}&palletForm=${palletForm}&fileName=${fileName}`
        },
        handleSelectionChange (val) {
            this.selectedList = val
        },
        async onQueryList (params) {
            extend(params, { state: this.activeTab })
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
            return httpGet(`/api/admin/orders/getOrdersByPalletId/${this.pallet._id}`, params)
        },
        async singleAddOrder () {
            if (!this.addOrderInput) {
                return
            }
            try {
                const inputCopy = this.addOrderInput
                this.addOrderInput = ''
                this.addOrderloading = true
                await httpPost('/api/admin/orders/setPallet', { orderNumber: inputCopy, palletId: this.pallet._id })
                this.$refs.warningTone.warningSuccess()
                this.queryList()
            } catch (e) {
                this.$refs.warningTone.warningFail()
                this.$message.error(e.message)
            } finally {
                this.addOrderloading = false
                this.$refs.addOrderInput.$el.getElementsByTagName('input')[0].focus()
            }
        },

        async removeOrder (index, row) {
            try {
                this.loading = true
                await httpPost(`/api/admin/orders/removeFromPallet/${row.orderNumber}`)
                this.list.splice(index, 1)
                this.total--
            } catch (e) {
                this.$message.error(e.message)
            } finally {
                this.loading = false
            }
        },
        formateCreateTime (row) {
            return row.createTime && formatDate(new Date(row.createTime), 'yyyy/MM/dd HH:mm')
        },
        handleTariffEdit (index, row) {
            this.tariffEditForm.id = row._id
            smartExtend(this.tariffEditForm, row)
            this.tariffEditForm.dialogVisible = true
        },
        handleTariffClose () {
            this.tariffEditForm = {
                _id: '',
                tariff: '',
                tariffCNY: '',
                tariffState: '',
                tariffType: '',
                state: '',

                loading: false,
                dialogVisible: false
            }
            try {
                this.$refs.tariffEditForm.resetFields()
            } catch (e) {
            }
        },
        tariffSubmit () {
            this.$refs.tariffEditForm.validate(async valid => {
                if (valid) {
                    try {
                        this.tariffEditForm.loading = true
                        await httpPost(`/api/admin/orders/${this.tariffEditForm.id}/tariff`, this.tariffEditForm)
                        this.handleTariffClose()
                        this.queryList(this.pageNo)
                    } catch (e) {
                        this.$message.error(e.message)
                    } finally {
                        this.tariffEditForm.loading = false
                    }
                }
            })
        },
        async noTariff (id) {
            try {
                this.tariffEditForm.loading = true
                await httpPost(`/api/admin/orders/${id}/noTariff`)
                this.handleTariffClose()
                this.queryList(this.pageNo)
            } catch (e) {
                this.$message.error(e.message)
            } finally {
                this.tariffEditForm.loading = false
            }
        },
        handleDlIdCard () {
            const orders = this.selectedList
            const fileList = []
            orders.forEach(order => {
                if (order.recipientIdCardPositiveImg && order.recipientIdCardBackImg) {
                    const fileName = order.recipientIdNumber ? `${order.orderNumber}${order.recipientName}${order.recipientIdNumber}` : `${order.orderNumber}${order.recipientName}`

                    fileList.push({
                        id: order.recipientIdCardPositiveImg,
                        fileName: `${fileName}(1)`
                    })

                    fileList.push({
                        id: order.recipientIdCardBackImg,
                        fileName: `${fileName}(2)`
                    })
                }
            })
            window.location.href = `/api/files/batchDl?fileList=${JSON.stringify(fileList)}`
        },
        handleDlAllIdCard () {
            window.location.href = `/api/admin/pallet/${this.pallet._id}/DlIdCard`
        },
        handleDlAllMergeIdCard (option) {
            window.location.href = `/api/admin/pallet/${this.pallet._id}/DlMergeIdCard?${option ? Object.keys(option).map(key => `${key}=${encodeURIComponent(option[key])}`).join('&') : ''}`
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
        this.queryList()
    }
}
</script>
<style lang="less" scoped>
.toolbar {

    .pallet-info {
        color: #1f2d3d;

        .pallet-info-col {
            float: left;
            line-height: 22px;
            width: 220px;

            .pallet-info-col-item {
                display: block;

                .pallet-info-col-item-title-1 {
                    display: inline-block;
                    width: 75px;
                }

                .pallet-info-col-item-title-2 {
                    display: inline-block;
                    width: 90px;
                }
            }
        }
        .pallet-info-col-before-col {
            border-right: 1px solid #6f829e;
            margin-right: 10px;
        }
    }
}
</style>
