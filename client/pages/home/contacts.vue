<template>
    <div class="home-contacts">
        <div class="toolbar-top">
            <el-button @click="editForm.dialogVisible = true" size="small" class="left">新增</el-button>
            <el-input placeholder="通过姓名或手机号搜索" v-model="searchFormInput.mixSearch" size="small" @keyup.enter.native="search" class="right" style="width:300px">
                <el-button @click="search" slot="append" icon="el-icon-search"></el-button>
            </el-input>
        </div>

        <el-tabs style="margin-top:5px;" v-model="activeName" @tab-click="handleTabClick">
            <el-tab-pane :label="tab.label" :name="tab.name" v-for="tab in tabs" :key="tab.name">
            </el-tab-pane>
        </el-tabs>
        
        <el-table :data="list" border v-loading="loading">
            <el-table-column width="90px" label="姓名" prop="name" show-overflow-tooltip>
            </el-table-column>
            <el-table-column label="地址" :formatter="row => row.address.join(' ')" show-overflow-tooltip>
            </el-table-column>
            <el-table-column width="110px" label="手机号码" prop="cellphoneNumber" show-overflow-tooltip>
            </el-table-column>
            <el-table-column width="165px" label="身份证号" prop="idNumber" show-overflow-tooltip>
            </el-table-column>
            <el-table-column label="身份证图" width="80px" align='center'>
                <template slot-scope="scope">
                    <el-row :gutter="2" v-if="scope.row.idNumber&&scope.row.idCardPositiveImg&&scope.row.idCardBackImg">
                        <el-col :span="12"><idcard v-model="scope.row.idCardPositiveImg">正面</idcard></el-col>
                        <el-col :span="12"><idcard v-model="scope.row.idCardBackImg">背面</idcard></el-col>
                    </el-row>
                    <font color="green" v-if="scope.row.idNumber&&(!(scope.row.idCardPositiveImg&&scope.row.idCardBackImg))">未传图片</font>
                    <font color="red" v-if="!(scope.row.idNumber)">未填号码</font>
                </template>
            </el-table-column>
            <el-table-column width="90px" label="操作">
                <template slot-scope="scope">
                    <el-button type="text" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <confirm-button type="text" tip="是否确认删除 ?" @confirm="handleDel(scope.$index, scope.row)">删除</confirm-button>
                </template>
            </el-table-column>
        </el-table>
    
        <div class="toolbar">
            <el-pagination class="pager-block" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNo" :page-sizes="pageSizes" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </div>

        <el-dialog title="联系人编辑" custom-class="width:800px" :visible.sync="editForm.dialogVisible" :before-close="handleClose">
            <el-form :model="editForm" :rules="rules" ref="editForm" status-icon label-width="100px" class="demo-editForm">
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="联系人类型" prop="contactsType">
                            <el-radio-group v-model="editForm.contactsType">
                                <el-radio :label="1">收件人</el-radio>
                                <el-radio :label="0">发件人</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="发货网点" prop="branch" v-if="editForm.contactsType == 0">
                            <el-select v-model="editForm.branch" placeholder="请选择发货网点" @change="handleBranchChange">
                                <el-option :label="branch.name" :value="branch._id" v-for="branch in branchs" :key="branch._id"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="姓名" prop="name">
                    <el-input v-model="editForm.name"></el-input>
                </el-form-item>
                <el-form-item label="证件号码" prop="idNumber">
                    <el-input v-model="editForm.idNumber"></el-input>
                </el-form-item>
                <el-form-item label="地区" prop="address">
                    <area-selector v-model="editForm.address" areaType="0" v-if="editForm.contactsType == 0" key="areaType0"></area-selector>
                    <area-selector v-model="editForm.address" areaType="1" v-else key="areaType1"></area-selector>
                </el-form-item>
                <el-form-item label="详细地址" prop="detailAddress">
                    <el-input v-model="editForm.detailAddress"></el-input>
                </el-form-item>
                <el-form-item label="手机号码" prop="cellphoneNumber">
                    <el-input v-model="editForm.cellphoneNumber"></el-input>
                </el-form-item>
                <el-form-item label="证件上传" prop="idCardImg">
                    <div class="el-row--flex">
                        <id-card-upload v-model="editForm.idCardPositiveImg">点击上传正面</id-card-upload>
                        <id-card-upload v-model="editForm.idCardBackImg" style="margin-left:20px;">点击上传背面</id-card-upload>
                    </div>
                </el-form-item>
                <el-form-item label="默认" prop="isDefault">
                    <el-switch on-text="" off-text="" v-model="editForm.isDefault"></el-switch>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submit" :loading="editForm.loading">提交</el-button>
                    <el-button @click="handleClose">取消</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
import pageMixins from '~/mixins/pageMixins'
import idCardUpload from '~/components/idCardUpload'
import ConfirmButton from '~/components/ConfirmButton'
import AreaSelector from '~/components/AreaSelector'
import Idcard from '~/components/Idcard'
import { httpGet, httpPost, httpDelete } from '~/plugins/axios'
import { extend, smartExtend, validatePhoneNumber } from '~/plugins/tool'

export default {
    mixins: [pageMixins()],
    components: {
        idCardUpload,
        Idcard,
        ConfirmButton,
        AreaSelector
    },
    head: {
        title: '常用联系人'
    },
    async asyncData ({ store, query, route, error }) {
        const { list } = await httpGet('/api/branchs')
        return { branchs: list }
    },
    data () {
        return {
            label: '常用联系人',
            tabs: [
                { name: '1', label: '收件人' },
                { name: '0', label: '发件人' }
            ],
            activeName: '1',

            editForm: {
                id: '', // 有id编辑，无id新增
                contactsType: 1,
                branch: '',
                name: '',
                idNumber: '',
                address: [],
                detailAddress: '',
                cellphoneNumber: '',
                idCardPositiveImg: null,
                idCardBackImg: null,
                isDefault: false,

                loading: false,
                dialogVisible: false
            },

            rules: {
                branch: [
                    { required: true, message: '发货网点为必选项', trigger: 'submit' }
                ],
                name: [
                    { required: true, message: '请输入姓名', trigger: 'submit' }
                ],
                address: [
                    { type: 'array', required: true, message: '请选择地区', trigger: 'submit' }
                ],
                detailAddress: [
                    { required: true, message: '请输入详细地址', trigger: 'submit' }
                ],
                cellphoneNumber: [
                    {
                        validator: (rule, value, callback) => {
                            if (this.editForm.contactsType === 0) {
                                callback(validatePhoneNumber(this.editForm.cellphoneNumber, 'canada', '加拿大'))
                            } else {
                                callback(validatePhoneNumber(this.editForm.cellphoneNumber, 'china', '中国大陆'))
                            }
                        },
                        trigger: 'blur'
                    },
                    { required: true, message: '请输入手机号码', trigger: 'submit' }
                ],
                idCardImg: [
                    {
                        validator: (rule, value, callback) => {
                            if (this.editForm.idCardPositiveImg && (!this.editForm.idCardBackImg)) {
                                callback(new Error('请同时上传证件正反面'))
                            } else if ((!this.editForm.idCardPositiveImg) && this.editForm.idCardBackImg) {
                                callback(new Error('请同时上传证件正反面'))
                            } else {
                                callback()
                            }
                        },
                        trigger: 'submit'
                    }
                ]
            }
        }
    },

    methods: {
        handleTabClick (tab, event) {
            this.queryList(1)
        },
        async onQueryList (params) {
            extend(params, {contactsType: this.activeName})
            return httpGet(`/api/users/contacts`, params)
        },
        handleEdit (index, row) {
            this.editForm.id = row._id
            smartExtend(this.editForm, row)
            this.editForm.detailAddress = this.editForm.address.pop()
            this.editForm.dialogVisible = true
        },
        handleClose () {
            this.editForm = {
                id: '', // 有id编辑，无id新增
                contactsType: 1,
                branch: '',
                name: '',
                idNumber: '',
                address: [],
                detailAddress: '',
                cellphoneNumber: '',
                idCardPositiveImg: null,
                idCardBackImg: null,
                isDefault: false,

                loading: false,
                dialogVisible: false
            }
            this.$refs.editForm.resetFields()
        },
        async onRowDelete (row, index) {
            return httpDelete(`/api/users/contacts/${row._id}`)
        },
        submit () {
            this.$refs.editForm.validate(async (valid) => {
                if (valid) {
                    try {
                        if (this.editForm.contactsType === 1) this.editForm.branch = null
                        this.editForm.loading = true
                        this.editForm.address.push(this.editForm.detailAddress)
                        await httpPost(
                            this.editForm.id
                                ? `/api/users/contacts/${this.editForm.id}`
                                : '/api/users/contacts', this.editForm)
                        this.activeName = this.editForm.contactsType.toString()
                        this.queryList(this.pageNo)
                        this.handleClose()
                    } catch (e) {
                        this.editForm.address.pop()
                        this.$message.error(e.message)
                    } finally {
                        this.editForm.loading = false
                    }
                }
            })
        }
    },
    async mounted () {
        this.queryList()
    }
}
</script>
