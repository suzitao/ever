<template>
    <el-dialog title="权限分配" :visible.sync="dialogVisible" :before-close="handleClose" width="650px" class="permission-dialog">
        <div class="permission-dialog-body" v-loading="initPermissionItemLoading || initPermissionLoading">
            <div class="permission-container" v-for="(item, index) in editForm" :key="index">
                <div class="container-lable">{{getBranchName(item.branch)}}</div>
                <div class="container-inner">
                    <div style="height: 29px;"><el-checkbox :indeterminate="item.isIndeterminate" v-model="item.checkAll" @change="handleCheckAllChange($event, index)">全选 / Check All</el-checkbox></div>
                    <el-checkbox-group v-model="item.permissionItems">
                        <div v-for="permissionItem in permissionItemList" :key="permissionItem._id" style="width: 25%;display:inline-block"><el-checkbox :label="permissionItem._id" @change="setCheckAllAndIsIndeterminate(editForm[index])" >{{permissionItem.name}}</el-checkbox></div>
                    </el-checkbox-group>
                </div>
            </div>
        </div>
        <div slot="footer" class="dialog-footer">
            <el-button size="small" type="primary" @click="handleSubmit" :loading="submitLoading" :disabled="initPermissionItemLoading">提交</el-button>
            <el-button size="small" @click="handleClose">取消</el-button>
        </div>
    </el-dialog>
</template>

<script>
// permissionItem/getAllPermissionItem
import { httpGet, httpPost } from '~/plugins/axios'
import { mapState } from 'vuex'
export default {
    data () {
        return {
            permissionItemList: [],
            user: null,
            editForm: [],

            initPermissionItemLoading: true,
            initPermissionLoading: true,
            submitLoading: false,
            dialogVisible: false
        }
    },
    computed: {
        ...mapState('admin', ['branchs'])
    },
    methods: {
        async handleEdit (user) {
            this.dialogVisible = true
            this.user = user
            const permissionList = await httpGet(`/api/admin/user/${this.user._id}/getUserPermission`)
            this.editForm = user.branchRanges.map(branch => {
                let permissionItems = []
                permissionList.forEach(item => {
                    if (branch === item.branch) permissionItems = item.permissionItems
                })
                return this.setCheckAllAndIsIndeterminate({ branch, permissionItems })
            })
            this.initPermissionLoading = false
        },
        handleClose () {
            this.user = null
            this.editForm = []
            this.initPermissionLoading = true
            this.submitLoading = false
            this.dialogVisible = false
        },
        async handleSubmit () {
            if (this.initPermissionItemLoading || this.initPermissionLoading) return
            this.submitLoading = true
            try {
                await httpPost(`/api/admin/user/${this.user._id}/setUserPermission`, this.editForm.map(item => { return { branch: item.branch, permissionItems: item.permissionItems } }))
                this.handleClose()
            } catch (e) {
                this.$message.error(e.message)
                this.submitLoading = false
            }
        },
        getBranchName (branchId) {
            let name = ''
            this.branchs.forEach(item => {
                if (branchId === item._id) name = item.name
            })
            return name
        },
        handleCheckAllChange (val, index) {
            const editFormOne = this.editForm[index]
            editFormOne.permissionItems = val ? this.permissionItemList.map(item => item._id) : []
            editFormOne.isIndeterminate = false
        },
        setCheckAllAndIsIndeterminate (item) {
            const checkedCount = item.permissionItems.length
            item.checkAll = checkedCount === this.permissionItemList.length
            item.isIndeterminate = checkedCount > 0 && checkedCount < this.permissionItemList.length
            return item
        }
    },
    async mounted () {
        this.permissionItemList = await httpGet('/api/admin/permissionItem/getAllPermissionItem')
        this.initPermissionItemLoading = false
    }
}
</script>

<style lang="less">
.permission-dialog {

    .permission-dialog-body {
        width: 100%;
        height: 500px;
        overflow: auto;

        .permission-container {
            width: 100%;

            .container-lable {
                margin-left: 10px;
            }

            .container-inner {
                width: 100%;
                padding: 10px;
                box-sizing: border-box;
                border: 1px solid #ebeef5;
            }
        }

        .permission-container + .permission-container {
            margin-top: 10px;
        }
    }
}
</style>
