<template>
    <div class="home-order-add">
        <goods-dialog ref="goodsDialog" @confirm="handleSelectedGoods"></goods-dialog>
        <el-form size="small" :model="editForm" :rules="rules" ref="editForm" label-width="100px" @submit.native.prevent>
            <div class="order-panel">
                <div class="title">网点与线路</div>
                <el-row>
                    <el-col :span="8">
                        <el-form-item label="发货网点" prop="branch">
                            <el-select v-model="editForm.branch" placeholder="请选择发货网点" @change="handleBranchChange">
                                <el-option :label="branch.name" :value="branch._id" v-for="branch in branchs" :key="branch._id"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="运送线路" prop="line">
                            <el-select v-model="editForm.line" placeholder="请选择发货线路" @change="handleLineChange">
                                <el-option :label="line.name" :value="line._id" v-for="line in lines" :key="line._id"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8"></el-col>
                    <el-col :span="24">
                        <el-form-item label="线路说明">
                            <span>{{activeLine && activeLine.description}}</span>
                        </el-form-item>
                    </el-col>
                </el-row>
            </div>

            <div class="order-panel">
                <div class="title">
                    发件人信息
                    <el-checkbox v-model="editForm.saveSender" style="float: right;margin-right: 20px">同步保存发件人信息</el-checkbox>
                    <el-button type="text" size="small" @click="clearContract('sender')" style="float:right;margin:-2px 20px 0 0">清空</el-button>
                    <span v-if="editForm.senderId" style="float:right;margin-top:1px;font-size:10px;color:red;">直接修改将会同步更新现有常用联系人，如需同步新增常用联系人请先点击</span>
                </div>
                <el-row>
                    <el-col :span="8">
                        <el-form-item label="发件人" prop="senderName">
                            <contact-selector placeholder="请填写或选择发件人" v-model="editForm.senderName" @select="onContactSelect($event, 'sender')" :contactsType="0"></contact-selector>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="证件号码" prop="senderIdNumber">
                            <el-input placeholder="请填写发件人证件号码" v-model="editForm.senderIdNumber"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="手机号码" prop="senderCellphoneNumber">
                            <el-input placeholder="请输入发件人手机号码" v-model="editForm.senderCellphoneNumber"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="8">
                        <el-form-item label="发件地区" prop="senderAddress">
                            <area-selector placeholder="请选择收货地区" v-model="editForm.senderAddress" areaType="0"></area-selector>
                        </el-form-item>
                    </el-col>
                    <el-col :span="16">
                        <el-form-item label="详细地址" prop="senderDetailAddress">
                            <el-input placeholder="请输入发件人详细地址" v-model="editForm.senderDetailAddress"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
            </div>

            <div class="order-panel">
                <div class="title">
                    收件人信息
                    <el-checkbox v-model="editForm.saveRecipient" style="float: right;margin-right: 20px">同步保存收件人信息</el-checkbox>
                    <el-button type="text" size="small" @click="clearContract('recipient')" style="float:right;margin:-2px 20px 0 0">清空</el-button>
                    <span v-if="editForm.recipientId" style="float:right;margin-top:1px;font-size:12px;color:red;">直接修改将会同步更新现有常用联系人，如需同步新增常用联系人请先点击</span>
                </div>
                <el-row>
                    <el-col :span="8">
                        <el-form-item label="收件人" prop="recipientName">
                            <contact-selector placeholder="请填写或选择收件人" v-model="editForm.recipientName" @select="onContactSelect($event, 'recipient')" :contactsType="1"></contact-selector>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="证件号码" prop="recipientIdNumber">
                            <el-input placeholder="请输入收件人证件号码" v-model="editForm.recipientIdNumber"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="手机号码" prop="recipientCellphoneNumber">
                            <el-input placeholder="请输入收件人手机号码" v-model="editForm.recipientCellphoneNumber"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="8">
                        <el-form-item label="收件地区" prop="recipientAddress">
                            <area-selector placeholder="请选择收货地区" v-model="editForm.recipientAddress" areaType="1"></area-selector>
                        </el-form-item>
                    </el-col>
                    <el-col :span="16">
                        <el-form-item label="详细地址" prop="recipientDetailAddress">
                            <el-input placeholder="请输入收件人详细地址" v-model="editForm.recipientDetailAddress"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="16">
                        <el-form-item label="地址识别" prop="addressToParse">
                            <el-input 
                            type="textarea"
                            :rows="3"
                            placeholder="试试粘贴收件人姓名、手机号、收货地址，可快速识别您的收货信息" 
                            v-model="editForm.addressToParse"
                            ></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="4">
                        <el-button-group>
                            <el-button type="primary" @click="parseAddress()">识别</el-button>
                        </el-button-group>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="14">
                    <el-form-item label="证件上传" prop="recipientIdCardImg">
                        <div class="el-row--flex">
                            <id-card-upload v-model="editForm.recipientIdCardPositiveImg">点击上传正面</id-card-upload>
                            <id-card-upload v-model="editForm.recipientIdCardBackImg" style="margin-left:20px;">点击上传背面</id-card-upload>
                        </div>
                    </el-form-item>
                    </el-col>
                    <el-col :span="10">
                        <el-checkbox v-model="editForm.isSendMessage">短信通知收件人</el-checkbox>
                    </el-col>
                </el-row>
            </div>

            <div class="order-panel orderGoods-panel">
                <div class="title">物品信息</div>
                <el-form-item label-width="0" prop="orderGoods">
                    <el-table :data="editForm.orderGoods" border>
                        <el-table-column label="物品名称">
                            <template slot-scope="scope">
                                <el-input v-model="editForm.orderGoods[scope.$index].name" placeholder="请输入物品名称"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="品牌">
                            <template slot-scope="scope">
                                <el-input v-model="editForm.orderGoods[scope.$index].brand" placeholder="请输入物品品牌"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="规格" width="120px">
                            <template slot-scope="scope">
                                <el-input v-model="editForm.orderGoods[scope.$index].measurementUnit" placeholder="粒,kg,ml..."></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="数量" width="100px">
                            <template slot-scope="scope">
                                <el-input v-model="editForm.orderGoods[scope.$index].quantity"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="申报单价($)" width="100px">
                            <template slot-scope="scope">
                                <el-input v-model="editForm.orderGoods[scope.$index].valueDeclared" placeholder=""></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="170px">
                            <template slot-scope="scope">
                                <el-checkbox v-model="editForm.orderGoods[scope.$index].saveGoods">保存常用物品</el-checkbox>
                                <el-button @click.native.prevent="deleteGoodsRow(scope.$index, editForm.orderGoods)" type="text" style="margin-left:10px;">移除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-form-item>
                <div style="margin-top: -20px">
                    <el-button type="primary" size="mini" @click="addGoodsRow()">增加 + </el-button>
                    <el-button type="primary" size="mini" @click="selectGoods">选择常用物品 + </el-button>
                </div>
            </div>

            <div class="order-panel">
                <div class="title">保价</div>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="附加保额" prop="isValueDeclared">
                            <el-switch v-model="editForm.isValueDeclared" :disabled="activeLine && !activeLine.isSupportValueDeclared"></el-switch>
                            <span v-if="activeLine && !activeLine.isSupportValueDeclared" style="margin-left:20px">(本线路不支持附加保额，默认保额{{activeLine.defaultCoverage}})</span>
                            <span v-if="activeLine && activeLine.isSupportValueDeclared" style="margin-left:20px">(默认保额${{activeLine.defaultCoverage}}，附加保额每增加$100保险费增加${{100*activeLine.valueDeclaredRate}}，保额最高上限为${{activeLine.maxCoverage}}。)</span>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="附加保额" prop="coverage">
                            <el-input placeholder="请输入需要附加的保额" v-model="editForm.coverage" @blur="countPremium()" :disabled="!editForm.isValueDeclared"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="保险费" prop="premium">
                            <el-input v-model="editForm.premium" :disabled="true"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-checkbox v-model="editForm.isAgreeToInsuranceClause" :disabled="!editForm.isValueDeclared" style="margin: 8px 0 0 30px">
                            <nuxt-link target="_blank" :to="'/help/faq'">我已了解并同意订单保险条款</nuxt-link>
                        </el-checkbox>
                    </el-col>
                </el-row>
            </div>

            <div class="order-panel">
                <div class="title">备注</div>
                <el-input placeholder="运单备注信息，可不填" type="textarea" v-model="editForm.remark"></el-input>
            </div>

            <div class="order-panel" style="margin-top: 20px">
                <el-row>
                    <el-col :span="18">
                        <el-checkbox v-model="editForm.isAgreeToForwardingClause" style="margin: 8px 0 0 30px">
                            <nuxt-link target="_blank" :to="'/help/faq'">我已了解并同意各项服务条款</nuxt-link>
                        </el-checkbox>
                    </el-col>
                    <el-col :span="6">
                        <el-button type="primary" @click="submit()" :loading="editForm.loading" :disabled="!((editForm.isAgreeToInsuranceClause&&editForm.isAgreeToForwardingClause)||(!editForm.isValueDeclared&&editForm.isAgreeToForwardingClause))">提交</el-button>
                        <el-button @click="resetForm()">重置</el-button>
                    </el-col>
                </el-row>
            </div>
        </el-form>
    </div>
</template>
<script>
import idCardUpload from '~/components/idCardUpload'
import ContactSelector from '~/components/ContactSelector'
import GoodsDialog from '~/components/dialog/GoodsDialog'
import AreaSelector from '~/components/AreaSelector'
import { httpGet } from '~/plugins/axios'
import addressParse from '~/plugins/addressParse'
import { smartExtend, identityCodeValid, formatChinaCellphoneNumber, formatCanadaCellphoneNumber, isEmptyObject, validatePhoneNumber } from '~/plugins/tool'
/**
 * 格式化地址，最后一个是详细地址
 * @param {string[]} address
 * @returns {string[]}
 */
function formatAddress (address) {
    if (address.length > 0) {
        return [address.slice(0, address.length - 1), address[address.length - 1]]
    } else {
        return []
    }
}

function createEmptyEditForm () {
    return {
        addressToParse: '',
        lineDescription: '',
        branch: '',
        line: '',
        senderId: '',
        senderName: '',
        senderIdNumber: '',
        senderCellphoneNumber: '',
        senderAddress: [],
        senderDetailAddress: '',
        recipientId: '',
        recipientName: '',
        recipientIdNumber: '',
        recipientCellphoneNumber: '',
        recipientAddress: [],
        recipientDetailAddress: '',
        recipientIdCardPositiveImg: null,
        recipientIdCardBackImg: null,
        isSendMessage: true,
        isValueDeclared: false,
        coverage: '',
        premium: '',
        valueDeclaredRate: 0,
        defaultCoverage: 0,
        isAgreeToInsuranceClause: false,
        remark: '',
        isAgreeToForwardingClause: false,
        /* 物品信息 */
        orderGoods: [{
            brand: '',
            measurementUnit: '',
            name: '',
            quantity: '',
            valueDeclared: '',
            saveGoods: false
        }],

        saveSender: true,
        saveRecipient: true,

        loading: false
    }
}

export default {

    head () {
        return {
            title: this.label
        }
    },
    components: { idCardUpload, ContactSelector, GoodsDialog, AreaSelector },
    async asyncData ({ store, query, route, error }) {
        let branchs, editForm
        try {
            // 修改订单
            if (query.orderId) {
                const order = await store.dispatch('home/getOrder', query.orderId)
                if (!order) {
                    throw new Error('订单不存在或已删除')
                }
                const [senderAddress, senderDetailAddress] = formatAddress(order.senderAddress)
                const [recipientAddress, recipientDetailAddress] = formatAddress(order.recipientAddress)
                editForm = {
                    ...order,
                    branch: order.branch && order.branch._id,
                    line: order.line && order.line._id,
                    senderAddress,
                    senderDetailAddress,
                    recipientAddress,
                    recipientDetailAddress,
                    isAgreeToForwardingClause: false // 每次都要让用户确认同意条款
                }
                if (query.type === 'ADDNEW') {
                    editForm._id = ''
                    for (let index in editForm.orderGoods) {
                        delete editForm.orderGoods[index]._id
                    }
                }
            } else {
                // 新增订单
                editForm = createEmptyEditForm()
            }

            // get branchs
            const { list } = await httpGet('/api/branchs')
            branchs = list
            if (!editForm.branch && branchs.length === 1) {
                editForm.branch = branchs[0]._id
            }
        } catch (err) {
            return error({ statusCode: 404, message: err.message })
        }
        return { branchs, editForm }
    },
    data () {
        // 自定义校验规则
        var checkCoverage = (rule, value, callback) => {
            const exp = /^\d+$/
            if (this.editForm.isValueDeclared && !value) {
                callback(new Error('附加保额不能为空'))
            } else if (this.editForm.isValueDeclared && !exp.test(value)) {
                callback(new Error('附加保额必须为大于0的整数金额'))
            } else {
                callback()
            }
        }

        return {
            branchs: [], // 店铺
            /* 表单 */
            editForm: {}, // From asyncData

            rules: {
                branch: [{ required: true, message: '发货网点为必选项', trigger: 'submit' }],
                line: [{ required: true, message: '发货线路为必选项', trigger: 'submit' }],
                senderName: [{ required: true, message: '发件人为必填项', trigger: 'submit' }],
                senderCellphoneNumber: [
                    {
                        validator: (rule, value, callback) => {
                            this.editForm.senderCellphoneNumber = formatCanadaCellphoneNumber(this.editForm.senderCellphoneNumber)
                            callback(validatePhoneNumber(this.editForm.senderCellphoneNumber, 'canada', '加拿大'))
                        },
                        trigger: 'blur'
                    },
                    { required: true, message: '发件人手机号码为必填项', trigger: 'submit' }
                ],
                senderDetailAddress: [{ required: true, message: '发件人详细地址为必填项', trigger: 'submit' }],
                senderAddress: [{ type: 'array', required: true, message: '发件地区为必选项', trigger: 'submit' }],
                recipientName: [{ required: true, message: '收件人为必填项', trigger: 'submit' }],
                recipientIdNumber: [
                    {
                        validator: (rule, value, callback) => {
                            if (!value) {
                                callback()
                            } else if (!identityCodeValid(value)) {
                                callback(new Error('身份证号码校验不通过'))
                            } else {
                                callback()
                            }
                        },
                        trigger: 'blur'
                    },
                    {
                        validator: (rule, value, callback) => {
                            if (!value && (this.editForm.recipientIdCardPositiveImg || this.editForm.recipientIdCardBackImg)) {
                                callback(new Error('已上传证件请填写身份证号码'))
                            } else {
                                callback()
                            }
                        },
                        trigger: 'submit'
                    }
                ],
                recipientCellphoneNumber: [
                    {
                        validator: (rule, value, callback) => {
                            this.editForm.recipientCellphoneNumber = formatChinaCellphoneNumber(this.editForm.recipientCellphoneNumber)
                            callback(validatePhoneNumber(this.editForm.recipientCellphoneNumber, 'china', '中国大陆'))
                        },
                        trigger: 'blur'
                    },
                    { required: true, message: '收件人手机号码为必填项', trigger: 'submit' }
                ],
                recipientAddress: [{ type: 'array', required: true, message: '收件地区为必选项', trigger: 'submit' }],
                recipientDetailAddress: [
                    // {
                    //     validator: async (rule, value, callback) => {
                    //         const ak = 'CgHdywPhpoePnHEI5lnc64aS9EPEiUrX'
                    //         let location
                    //         window.aaaa = (data) => {
                    //             if (data.status === 0) {
                    //                 console.log(location)
                    //                 location = data.result.location
                    //                 window.bbbb = (data) => {
                    //                     if (data.status === 0) {
                    //                         console.log(data)
                    //                         const area = data.result.addressComponent
                    //                         this.editForm.recipientAddress = [area.province, area.city, area.district]
                    //                     }
                    //                 }
                    //                 loadScript(`https://api.map.baidu.com/geocoder/v2/?callback=renderReverse&location=${location.lat},${location.lng}&output=json&pois=1&ak=${ak}&callback=bbbb`)
                    //             }
                    //         }
                    //         loadScript(`https://api.map.baidu.com/geocoder/v2/?address=${value}&output=json&ak=${ak}&callback=aaaa`)
                    //         callback()
                    //     },
                    //     trigger: 'blur'
                    // },
                    { required: true, message: '收件人详细地址为必填项', trigger: 'submit' }
                ],
                coverage: [{ validator: checkCoverage, trigger: 'submit' }],
                recipientIdCardImg: [
                    {
                        validator: (rule, value, callback) => {
                            if (this.editForm.recipientIdCardPositiveImg && (!this.editForm.recipientIdCardBackImg)) {
                                callback(new Error('请同时上传证件正反面'))
                            } else if ((!this.editForm.recipientIdCardPositiveImg) && this.editForm.recipientIdCardBackImg) {
                                callback(new Error('请同时上传证件正反面'))
                            } else {
                                callback()
                            }
                        },
                        trigger: 'submit'
                    }
                ],
                orderGoods: [
                    {
                        validator: (rule, value, callback) => {
                            if (this.editForm.orderGoods.length < 1) {
                                callback(new Error('请填写物品信息'))
                            }
                            this.editForm.orderGoods.forEach(good => {
                                if (!(good.name.toString().trim() && good.measurementUnit.toString().trim() && good.quantity.toString().trim() && good.valueDeclared.toString().trim())) {
                                    callback(new Error('物品名称、规格、数量、申报单价均为必填项'))
                                }
                                const exp1 = /^([1-9][\d]{0,7}|0)(\.[\d]{1,2})?$/
                                const exp2 = /^\d+(?=\.{0,1}\d+$|$)/
                                if (!exp1.test(good.valueDeclared.toString().trim())) {
                                    callback(new Error('请填入正确的物品申报单价(大于0且小数点后不超过2位)'))
                                }
                                if (!exp2.test(good.quantity.toString().trim())) {
                                    callback(new Error('请填入正确的物品数量(大于0)'))
                                }
                            })
                            callback()
                        },
                        trigger: 'submit'
                    }
                ]
            }
        }
    },
    computed: {
        label () {
            return this.$route.query.type === 'EDIT' ? '修改运单' : '新增运单'
        },
        activeBranch () {
            return this.branchs.find(branch => this.editForm.branch === branch._id)
        },
        activeLine () {
            return this.editForm.line ? this.lines.find(line => this.editForm.line === line._id) : null
        },
        lines () {
            return (this.activeBranch && this.activeBranch.lineList) || []
        }
    },
    methods: {
        handleBranchChange (branchId) {
            this.editForm.line = ''
        },
        handleLineChange (lineId) {
            if (!this.activeLine.isSupportValueDeclared) {
                this.editForm.isValueDeclared = false
            }
            this.editForm.valueDeclaredRate = this.activeLine.valueDeclaredRate
            this.editForm.defaultCoverage = this.activeLine.defaultCoverage
            this.countPremium()
        },
        countPremium () {
            if (this.activeLine && this.editForm.coverage) {
                this.editForm.premium = (Number(this.editForm.coverage) * Number(this.activeLine.valueDeclaredRate)).toFixed(2)
            } else {
                this.editForm.premium = ''
            }
        },
        onContactSelect (contact, type) {
            this.editForm[`${type}Id`] = contact._id
            this.editForm[`${type}Name`] = contact.name
            this.editForm[`${type}IdNumber`] = contact.idNumber
            this.editForm[`${type}CellphoneNumber`] = contact.cellphoneNumber
            this.editForm[`${type}DetailAddress`] = contact.address.pop()
            this.editForm[`${type}Address`] = contact.address
            if (type === 'sender') {
                this.editForm.branch = contact.branch
                this.handleBranchChange(contact.branch)
            }
            if (type === 'recipient') {
                this.editForm[`${type}IdCardPositiveImg`] = contact.idCardPositiveImg
                this.editForm[`${type}IdCardBackImg`] = contact.idCardBackImg
            }
        },
        clearContract (type) {
            this.editForm[`${type}Id`] = ''
            this.editForm[`${type}Name`] = ''
            this.editForm[`${type}IdNumber`] = ''
            this.editForm[`${type}CellphoneNumber`] = ''
            this.editForm[`${type}DetailAddress`] = ''
            this.editForm[`${type}Address`] = []
            if (type === 'recipient') {
                this.editForm[`${type}IdCardPositiveImg`] = null
                this.editForm[`${type}IdCardBackImg`] = null
            }
        },
        async initDefaultContract () {
            if (this.$route.query.type === 'ADDNEW' && !this.$route.query.orderId) {
                const dc = await httpGet('/api/users/contacts/getDefaultContacts')
                dc.map(item => {
                    this.onContactSelect(item, item.contactsType === 0 ? 'sender' : 'recipient')
                })
            }
        },
        initDefaultBranch () {
            if (this.$route.query.type === 'ADDNEW' && !this.$route.query.orderId) {
                for (const branch of this.branchs) {
                    if (branch.isDefault) this.editForm.branch = branch._id
                }
            }
        },
        isEmptyGoods (goods) {
            const newGood = { brand: '', measurementUnit: '', name: '', quantity: '', valueDeclared: '' }
            return isEmptyObject(smartExtend(newGood, goods))
        },
        async parseAddress () {
            const {addressToParse} = this.editForm
            const {name, phone, region, detailedAddress, id} = addressParse(addressToParse)
            const updatedAddressInfo = {
                recipientName: name,
                recipientCellphoneNumber: phone,
                recipientAddress: region,
                recipientDetailAddress: detailedAddress,
                recipientIdNumber: id
            }
            Object.assign(this.editForm, updatedAddressInfo)
        },
        addGoodsRow () {
            this.editForm.orderGoods.push({
                name: '',
                brand: '',
                measurementUnit: '',
                quantity: '',
                valueDeclared: '',
                saveGoods: false
            })
            console.log(this.editForm.orderGoods)
        },
        selectGoods () {
            this.$refs.goodsDialog.open()
        },
        handleSelectedGoods (goods) {
            const emptyGoods = this.editForm.orderGoods.filter(goods => this.isEmptyGoods(goods))
            for (const good of goods) {
                const empty = emptyGoods.shift()
                if (empty) {
                    smartExtend(empty, good)
                } else {
                    const newGood = { brand: '', measurementUnit: '', name: '', quantity: '', valueDeclared: '', saveGoods: false }
                    this.editForm.orderGoods.push(smartExtend(newGood, good))
                }
            }
        },
        deleteGoodsRow (index, data) {
            data.splice(index, 1)
        },
        /* 表单 */
        submit () {
            this.editForm.orderGoods = this.editForm.orderGoods.filter(goods => !this.isEmptyGoods(goods))
            if (this.editForm.orderGoods.length < 1) {
                this.addGoodsRow()
            }
            this.$refs.editForm.validate(async (valid) => {
                if (valid) {
                    try {
                        this.editForm.loading = true
                        if (this.editForm.isValueDeclared) {
                            this.countPremium()
                        } else {
                            this.editForm.premium = 0
                            this.editForm.coverage = 0
                        }
                        this.editForm.senderAddress.push(this.editForm.senderDetailAddress)
                        this.editForm.recipientAddress.push(this.editForm.recipientDetailAddress)
                        if (this.$route.query.type === 'EDIT') {
                            await this.$store.dispatch('home/updateOrder', {
                                id: this.$route.query.orderId,
                                data: this.editForm
                            })
                        } else if (this.$route.query.type === 'ADDNEW') {
                            await this.$store.dispatch('home/addOrder', this.editForm)
                        }
                        this.$message.success('操作成功')
                        this.$router.replace('/home/order')
                    } catch (e) {
                        this.$message.error(e.message)
                    } finally {
                        this.editForm.senderAddress.pop()
                        this.editForm.recipientAddress.pop()
                        this.editForm.loading = false
                    }
                } else {
                    console.log('不符合校验规则')
                    return false
                }
            })
        },
        resetForm () {
            this.$refs.editForm.resetFields()
        },
        batchAdd () {
            this.$router.push('/home/orderImport')
        }
    },
    mounted () {
        this.initDefaultBranch()
        this.initDefaultContract()
    }
}
</script>
<style lang="less">
.home-order-add {
    .order-panel {

        .title {
            line-height: 20px;
            padding-bottom: 6px;
            margin-top: 6px;
            border-bottom: solid 2px #adadad;
            margin-bottom: 10px;
        }
    }
    .orderGoods-panel {
        tr.el-table__row {
            td {

                .cell {

                    .el-input {
                        border-radius: 0px;

                        .el-input__inner {
                            border-radius: 0;
                            border: 0px;
                            background-color: transparent;
                            height: 100%;
                            padding: 0px;
                        }
                    }
                }
            }
        }
        .el-form-item__error {
            margin-left: 200px;
            padding-top: 10px;
        }
    }
}
</style>
