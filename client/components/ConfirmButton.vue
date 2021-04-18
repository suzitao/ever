<template>
    <el-popover class="confirm-button" placement="top" width="150" trigger="click" v-model="popoverVisible">
        <p>{{tip}}</p>
        <div style="text-align: right; margin-top: 15px">
            <el-button size="mini" type="text" @click="popoverVisible = false">取消</el-button>
            <el-button size="mini" type="primary" @click="handleConfirm">确定</el-button>
        </div>
        <el-button :type="type" :size="size" :disabled="disabled" slot="reference">
            <slot></slot>
        </el-button>
    </el-popover>
</template>
<script>
export default {
    props: {
        tip: String,
        type: {
            type: String,
            default: 'text'
        },
        size: {
            type: String,
            default: 'medium'
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            popoverVisible: false
        }
    },
    methods: {
        handleConfirm () {
            this.popoverVisible = false
            this.$emit('confirm')
        }
    }
}
</script>
<style lang="less">
.confirm-button + .confirm-button {
    margin-left: 10px;
}

.el-button + .confirm-button {
    margin-left: 10px;
}

.confirm-button + .el-button {
    margin-left: 10px;
}
</style>
