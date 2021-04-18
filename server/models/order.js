/**
 * Created by jim on 6/23/2017.
 */
import mongoose from 'mongoose'

const Schema = mongoose.Schema

// 运单
const OrderSchema = new Schema({

    orderNumber: {
        type: String,
        unique: true,
        required: '编码不能用空',
        trim: true
    },

    // 线路
    line: {
        type: Schema.Types.ObjectId,
        ref: 'Line'
    },

    // 发货网点
    branch: {
        type: Schema.Types.ObjectId,
        ref: 'Branch'
    },

    // 托盘
    pallet: {
        type: Schema.Types.ObjectId,
        ref: 'Pallet'
    },

    // 装盘网点
    palletBranch: {
        type: Schema.Types.ObjectId,
        ref: 'Branch'
    },

    // 状态
    state: {
        type: Number,
        default: 10,
        // 待收货-待付款-待入库-已入库-已发出-清关中-待支付关税-派送中-已签收-已取消
        enum: [10, 20, 30, 40, 50, 60, 65, 70, 80, 90]
    },

    // 来自快鸟快递的物流状态: 0-无轨迹，1-已揽收，2-在途中 201-到达派件城市，3-签收,4-问题件
    knState: {
        type: String,
        default: '0'
    },

    saveSender: {
        type: Boolean,
        default: false
    },

    senderId: {
        type: String
    },

    // 发货人姓名
    senderName: {
        type: String,
        required: '请输入发件人姓名',
        trim: true
    },

    // 发货人手机
    senderCellphoneNumber: {
        type: String,
        required: '请输入发件人手机号码',
        // validate: [/^[2-9][0-9]{9}$/, '发件人手机号码请输入正确的加大拿手机号码'],
        trim: true
    },

    // 发货人地址
    senderAddress: {
        type: [{
            type: String,
            required: true,
            trim: true
        }],
        required: '发件人地址不能为空'
    },

    // 发货人身份证号码
    senderIdNumber: {
        type: String,
        trim: true
    },

    saveRecipient: {
        type: Boolean,
        default: false
    },

    recipientId: {
        type: String
    },

    // 收件人姓名
    recipientName: {
        type: String,
        required: '请输入收件人姓名',
        trim: true
    },

    // 收件人手机
    recipientCellphoneNumber: {
        type: String,
        required: '请输入收件人手机号码',
        // validate: [/^1[0-9]{10}$/, '收件人手机号码请输入正确的中国大陆手机号码'],
        trim: true
    },

    // 收件人地址
    recipientAddress: {
        type: [{
            type: String,
            required: true,
            trim: true
        }],
        required: '收件人地址不能为空'
    },

    // 收件人身份证号码
    recipientIdNumber: {
        type: String,
        trim: true
    },

    // 收件人身份证正面图片
    recipientIdCardPositiveImg: {
        type: Schema.Types.ObjectId,
        ref: 'File'
    },

    // 收件人身份证反面图片
    recipientIdCardBackImg: {
        type: Schema.Types.ObjectId,
        ref: 'File'
    },

    // 是否短信通知收件人
    isSendMessage: {
        type: Boolean,
        default: true
    },

    orderGoods: [{
        type: Schema.Types.ObjectId,
        ref: 'OrderGoods'
    }],

    // 运单备注
    remark: {
        type: String
    },

    // 国内快递公司
    transhipmentExpressCompany: {
        type: Schema.Types.ObjectId,
        ref: 'ExpressCompany'
    },

    // 国内快递单号
    transhipmentExpressNumber: {
        type: String,
        trim: true
    },

    // 大头笔
    transhipmentExpressDestcode: {
        type: String,
        trim: true
    },

    // 实际重量
    actualWeight: {
        type: Number
    },

    // 计费重量
    chargeableWeight: {
        type: Number
    },

    // 称重操作人
    weighingOperator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    // 称重时间
    weighingTime: {
        type: Date
    },

    // 付款方式
    paymentMethod: {
        type: Number,
        // 10现金 20POS 30账户余额 35赊欠 40支付宝转账 45微信转账 50预留支付宝支付 55预留微信支付 60汇款 65支票 70其他
        enum: [10, 20, 30, 35, 40, 45, 50, 55, 60, 65, 70]
    },

    // 付款时间
    paymentTime: {
        type: Date
    },

    // 付款操作人
    paymentOperator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    // 费用总额:
    totalAmount: {
        type: Number
    },

    // 标准未含税金额
    standardAmountWithoutTariff: {
        type: Number
    },

    // 未含税金额
    amountWithoutTariff: {
        type: Number
    },

    // 运费单价
    unitPrice: {
        type: Number
    },

    // 首磅附加费
    poundSurcharge: {
        type: Number
    },

    // 偏远地区附加费
    extendedAreaSurcharge: {
        type: Number
    },

    // 运费
    freight: {
        type: Number
    },

    // 物料费
    materialCost: {
        type: Number
    },

    // 关税类型 0后付 1预付 2包税
    tariffType: {
        type: Number,
        enum: [0, 1, 2]
    },

    // 关税状态 0未确定 1毋需支付 2已确认待支付 3已支付
    tariffState: {
        type: Number,
        enum: [0, 1, 2, 3],
        default: 0
    },

    // 是否保价
    isValueDeclared: {
        type: Boolean,
        default: false
    },

    // 保险费率
    valueDeclaredRate: {
        type: Number
    },

    // 默认保价金额
    defaultCoverage: {
        type: Number
    },

    // 是否同意保险条款
    isAgreeToInsuranceClause: {
        type: Boolean,
        default: false
    },

    // 保险费
    premium: {
        type: Number
    },

    // 保额
    coverage: {
        type: Number
    },

    // 关税CAD
    tariff: {
        type: Number
    },

    // 关税汇率
    tariffExchangeRate: {
        type: Number
    },

    // 关税CNY
    tariffCNY: {
        type: Number
    },

    // 关税支付时间
    tariffPaymentTime: {
        type: Date
    },

    // 关税支付操作人
    tariffPaymentOperator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    // 关税支付方式
    tariffPaymentMethod: {
        type: Number,
        enum: [10, 20, 30, 40, 50]
    },

    // 是否打印过
    isPrinted: {
        type: Boolean,
        default: false
    },

    // 打印次数
    printTimes: {
        type: Number,
        default: 0
    },

    // 清关
    clearance: {
        type: Number,
        default: 10,
        enum: [10, 20, 21]
    },

    // 是否同意运输条款
    isAgreeToForwardingClause: {
        type: Boolean,
        default: false
    },

    account: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    status: {
        type: Number,
        default: 0,
        enum: [0, 1, 2]
    },

    createTime: {
        type: Date,
        default: Date.now
    },

    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

OrderSchema.index({ orderNumber: -1 })

export default mongoose.model('Order', OrderSchema)
