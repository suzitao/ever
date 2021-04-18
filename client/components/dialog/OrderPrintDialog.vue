<template>
    <el-dialog title="运单打印" :visible.sync="dialogVisible" :before-close="handleClose" width="650px">
        <div v-if="dialogVisible">
            <div v-if="this.printedList.length > 0">已打印过的运单：</div>
            <div v-if="this.printedList.length > 0" style="margin-bottom: 20px;">{{printedList.map(item => item.orderNumber + '、').join('')}}</div>
            <div v-if="this.printedList.length <= 0" style="color:green">所有运单未打印过</div>
            <div v-if="this.unPrintList.length <= 0" style="color:red">所有运单打印过</div>
        </div>
        <div slot="footer" class="dialog-footer">
            <div style="float: left;">打印尺寸
                <el-radio-group size="small" v-model="size">
                    <el-radio-button :label="1">4*6</el-radio-button>
                    <el-radio-button :label="6">2*4</el-radio-button>
                    <el-radio-button :label="2">letter</el-radio-button>
                    <!-- <el-radio-button :label="3">GJ-BC</el-radio-button>
                    <el-radio-button :label="4">GJ-CC</el-radio-button> -->
                    <el-radio-button :label="5" v-if="user.username==='pp2020' || user.username==='canadaliu'">just move</el-radio-button>
                </el-radio-group>
            </div>
            <el-button size="small" type="primary" @click="printOrdersWithoutPrinted" v-if="this.printedList.length > 0 && this.unPrintList.length > 0">只打印未打印过的运单</el-button>
            <el-button size="small" type="primary" @click="printAllOrders">继续打印所选运单</el-button>
            <el-button size="small" @click="handleClose">取消</el-button>
        </div>
    </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default {
    props: {
        orderList: {
            type: Array
        },
        source: {
            type: String
        }
    },
    computed: {
        ...mapState(['user'])
    },
    data () {
        return {
            dialogVisible: false,
            printList: [],
            printedList: [],
            unPrintList: [],
            size: '1'
        }
    },
    methods: {
        handlePrint () {
            this.printList = this.orderList
            this.printedList = this.printList.filter(order => order.isPrinted)
            this.unPrintList = this.printList.filter(order => !order.isPrinted)
            this.dialogVisible = true
        },
        handleClose () {
            this.dialogVisible = false
            this.printList = []
            this.printedList = []
            this.unPrintList = []
            this.size = '1'
        },
        printAllOrders () {
            window.open(`/orderPrint/size${this.size}?orders=${this.printList.map(order => order._id)}&source=${this.source}`)
        },
        printOrdersWithoutPrinted () {
            window.open(`/orderPrint/size${this.size}?orders=${this.unPrintList.map(order => order._id)}&source=${this.source}`)
        }
    }
}
</script>
