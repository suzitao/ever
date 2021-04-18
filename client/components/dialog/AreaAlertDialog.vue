<template>
    <el-dialog class="area-alert-dialog" :title="title" :visible.sync="dialogVisible" :before-close="handleAlertClose" width="500px">
        <div style="height:250px;overflow-y:auto;border:1px solid #e6e6e6;padding:10px;">
            <div style="overflow:hidden;white-space:nowrap;text-overflow:ellipsis;" v-for="(item, index) in data" :key="index">{{item[key] + ':  ' + item[value]}}</div>
        </div>
        <div slot="footer" class="dialog-footer">
            <el-button size="small" type="primary" @click="handleAlertClose">确定</el-button>
        </div>
    </el-dialog>
</template>
<script>
export default {
    data () {
        return {
            data: [],
            dialogVisible: false,
            key: 'key',
            value: 'value',
            title: ''
        }
    },
    methods: {
        alert (data) {
            this.data = data
            this.dialogVisible = true
        },
        handleAlertClose () {
            this.result = []
            this.dialogVisible = false
            this.$emit('close')
        }
    }
}
</script>

<style lang="less">
.area-alert-dialog {
    .el-dialog__body {
        padding: 10px 15px;
    }
}
</style>

