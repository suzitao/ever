<template>
    <el-dialog title="高级检索" :visible.sync="searchFormInput.dialogVisible" :before-close="handleSearchFormClose" width="650px">
        <el-form size="small" :model="searchFormInput" :rules="searchFormRules" ref="searchFormInput" status-icon label-width="100px">
            <el-form-item label="运单号" prop="orderNumber">
                <el-input v-model="searchFormInput.orderNumber"></el-input>
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
</template>

<script>
import { httpGet } from '~/plugins/axios'
import { smartExtend } from '~/plugins/tool'
export default {
    data () {
        return {
            lineList: [{value: '', label: '全部'}],
            searchForm: {
                orderNumber: '',
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
    methods: {
        handleMutipleSearch () {
            smartExtend(this.searchFormInput, this.searchForm)
            this.searchFormInput.dialogVisible = true
        },
        handleSearchFormClose () {
            smartExtend(this.searchFormInput, this.searchForm)
            this.searchFormInput.dialogVisible = false
        },
        handleSearchFormSubmit () {
            this.searchFormInput.dialogVisible = false
            this.searchFormInput._orderNumber = this.searchFormInput.orderNumber
            smartExtend(this.searchForm, this.searchFormInput)
            this.queryList()
        },
        search () {
            this.searchForm.recipientName = ''
            this.searchForm.recipientCellphoneNumber = ''
            this.searchForm.recipientIdNumber = ''
            this.searchForm.createTime = [null, null]
            this.searchForm.weighTime = [null, null]
            this.searchForm.line = ''
            this.searchForm.isPrinted = ''
            this.searchForm.goodsName = ''
            this.searchForm.orderNumber = this.searchFormInput._orderNumber
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
    }
}
</script>
