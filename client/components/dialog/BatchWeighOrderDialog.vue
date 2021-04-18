<template>
    <el-dialog title="批量称重" :visible.sync="dialogVisible" :before-close="handleClose" :close-on-click-modal="false" width="650px">
        <el-form size="small" label-position="top" :model="editForm" :rules="editFormRules" ref="editForm" status-icon label-width="120px" @submit.native.prevent>
            <el-form-item label="请在以下区域输入运单：" prop="orders">
                <el-input type="textarea" :rows="15" placeholder="运单号以回车分隔" v-model="editForm.orders">
                </el-input>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button size="small" type="primary" @click="handleSubmit" :loading="loading">提交</el-button>
            <el-button size="small" @click="handleClose">取消</el-button>
        </div>
        <warning-tone ref="warningTone"></warning-tone>
    </el-dialog>
</template>
<script>
import { httpGet } from '~/plugins/axios'
import WarningTone from '~/components/WarningTone'

const getOrderNumber = order => order.orderNumber

const getOrderState = (orderNumberList, orders, selectedLine, currentBranchId) => {
    const nonExistent = orderNumberList.filter(orderNumber => {
        const orderWithMatchingNumber = orders.find(order => order.orderNumber === orderNumber)
        return !orderWithMatchingNumber
    })
    const wrongBranch = orders.filter(order => {
        return order.branch._id !== currentBranchId
    }).map(getOrderNumber)
    const wrongLine = orders.filter(order => {
        return order.line._id !== selectedLine
    }).map(getOrderNumber)
    const invalidOrderNumbers = [...wrongBranch, ...wrongLine]
    const validOrders = orders.filter(order => {
        return !invalidOrderNumbers.includes(order.orderNumber)
    })

    const weighedOrders = validOrders.filter(order => order.state === 20).map(getOrderNumber)

    return {
        nonExistent,
        wrongBranch,
        wrongLine,
        validOrders,
        weighedOrders
    }
}

const getAlertMessage = (h, orderNumber, messageHeader) => {
    const headerElement = h('div', null, messageHeader)
    const listElements = orderNumber.map(number => h('div', null, number))
    const clipElements = [headerElement, ...listElements].slice(0, 25)
    return h('div', null, clipElements)
}

const getOrderNumberList = orderListInput => {
    // 删除前后空格，按行分割成array
    const formattedInput = orderListInput.trim().split('\n')
    const orderNumberList = formattedInput.map(row => {
        // 删除前后空格
        return row.trim()
    }).filter(row => {
        // 删除空行
        return !!row
    })
    return orderNumberList
}

export default {
    components: { WarningTone },
    props: {
        selectedLine: {
            type: String
        }
    },
    data () {
        return {
            orderInput: '',
            editForm: {
                orders: ''
            },
            editFormRules: {
                orders: [
                    { required: true, message: '请扫描或输入运单号', trigger: 'submit' }
                ]
            },
            checking: false,
            dialogVisible: false,
            loading: false
        }
    },
    methods: {
        handleEdit () {
            this.dialogVisible = true
        },
        handleClose () {
            this.orderInput = ''
            this.editForm = { orders: '' }
            this.checking = false
            this.dialogVisible = false
            this.loading = false
        },
        getOrderArray () {
            const reg = /\n(\n)*( )*(\n)*\n/g
            const oldArr = this.editForm.orders.replace(reg, '\n').split('\n')
            const res = []
            const json = {}
            for (var i = 0; i < oldArr.length; i++) {
                if (oldArr[i] && !json[oldArr[i]]) {
                    res.push(oldArr[i])
                    json[oldArr[i]] = 1
                }
            }
            return res
        },
        handleSubmit () {
            this.$refs.editForm.validate(async (valid) => {
                if (!valid) return
                try {
                    this.loading = true
                    const orderListInput = this.editForm.orders
                    const orderNumberList = getOrderNumberList(orderListInput)
                    const selectedLine = this.selectedLine
                    const currentBranchId = this.$store.getters['admin/currentBranch']._id
                    const orders = await httpGet('/api/admin/orders/batchWeigh', {orderNumberList})
                    this.loading = false
                    const {
                        nonExistent,
                        wrongBranch,
                        wrongLine,
                        validOrders,
                        weighedOrders
                    } = getOrderState(orderNumberList, orders, selectedLine, currentBranchId)
                    const h = this.$createElement

                    if (nonExistent.length > 0) {
                        const messageHeader = `以下订单不存在或状态不符`
                        try {
                            const message = getAlertMessage(h, nonExistent, messageHeader)
                            await this.$alert(message, '错误', {
                                confirmButtonText: '好的'
                            })
                        } catch (error) {
                            console.log(error)
                        }
                        return
                    }

                    if (wrongBranch.length > 0) {
                        const messageHeader = `以下订单不属于当前店铺`
                        try {
                            const message = getAlertMessage(h, wrongBranch, messageHeader)
                            await this.$alert(message, '错误', {
                                confirmButtonText: '好的'
                            })
                        } catch (error) {
                            console.log(error)
                        }
                        return
                    }

                    if (wrongLine.length > 0) {
                        const messageHeader = `以下订单线路不符合`
                        try {
                            const message = getAlertMessage(h, wrongLine, messageHeader)
                            await this.$alert(message, '错误', {
                                confirmButtonText: '好的'
                            })
                        } catch (error) {
                            console.log(error)
                        }
                        return
                    }

                    if (weighedOrders.length > 0) {
                        const messageHeader = `以下订单订单已称重，当前操作重新称重`
                        try {
                            const message = getAlertMessage(h, weighedOrders, messageHeader)
                            await this.$confirm(message, '提示', {
                                confirmButtonText: '重新称重',
                                cancelButtonText: '取消'
                            })
                        } catch (error) {
                            console.log(error)
                            return
                        }
                    }
                    this.$emit('after-submit', validOrders)
                    this.handleClose()
                } catch (e) {
                    this.$alert(e.message)
                    this.loading = false
                }
            })
        }
    }
}
</script>
