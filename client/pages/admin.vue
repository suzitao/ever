<template>
    <el-container v-loading.fullscreen.lock="fullscreenLoading">
        <el-header height="60px" class="admin-header">
            <div class="logo">
                <div class="logo-1">EVERFAST</div>
                <div class="logo-2">后台管理中心</div>
            </div>
            <div class="menu">
                <el-menu mode="horizontal" router :default-active="$route.path"  background-color="#545c64" text-color="#ffffff" active-text-color="#60bbff">
                    <!-- <el-menu-item index="/admin/workspace">工作台</el-menu-item> -->
                    <el-menu-item index="/admin/delivery/order/-10-90">发货管理</el-menu-item>
                    <el-menu-item index="/admin/order/orderMatch">运单处理</el-menu-item>
                    <!--<el-menu-item index="/admin/forward">转发管理</el-menu-item>-->
                    <el-menu-item index="/admin/pallet/list" v-if="currentBranch && currentBranch.isHub">托盘管理</el-menu-item>
                    <el-menu-item index="/admin/capital/capitalCount">资金管理</el-menu-item>
                    <el-menu-item index="/admin/customer/list">客户管理</el-menu-item>
                    <el-menu-item index="/admin/staff/list">员工管理</el-menu-item>
                    <el-menu-item index="/admin/setting/branch">系统设置</el-menu-item>
                </el-menu>
            </div>
            <div class="userinfo">
                <!-- 店铺列表 -->
                <el-dropdown class="branch" v-if="branchs && currentBranch">
                <span class="el-dropdown-link">
                    {{currentBranch.name}}<i class="el-icon-caret-bottom el-icon--right"></i>
                </span>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item v-for="branch in branchs" @click.native="switchBranch(branch)" :key="branch._id" :disabled="branch._id === currentBranch._id">{{branch.name}}</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
                <!-- 用户头像 -->
                <el-dropdown trigger="hover">
                    <div class="el-dropdown-link userinfo-inner">
                        <img :src="user.avatar"/> {{user.username}}
                    </div>
                    <el-dropdown-menu slot="dropdown">
                        <!--<el-dropdown-item>我的消息</el-dropdown-item>-->
                        <!--<el-dropdown-item>设置</el-dropdown-item>-->
                        <el-dropdown-item @click.native="$refs.personInfoDialog.handleEdit()">修改信息</el-dropdown-item>
                        <el-dropdown-item @click.native="$refs.changePasswordDialog.handleEdit()">修改密码</el-dropdown-item>
                        <el-dropdown-item @click.native="logout">退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>
            <change-password-dialog ref="changePasswordDialog"/>
            <person-info-dialog ref="personInfoDialog"/>
        </el-header>
        <nuxt-child></nuxt-child>
        <el-button class="locate-button locate-button-top" @click="scrollTop">返回顶部</el-button>
        <el-button class="locate-button locate-button-bottom" @click="scrollBottom">底部</el-button>
    </el-container>
</template>

<script>
import { mapState } from 'vuex'
import PersonInfoDialog from '~/components/dialog/PersonInfoDialog'
import ChangePasswordDialog from '~/components/dialog/ChangePasswordDialog'
export default {
    name: 'Admin',
    middleware: 'admin-authenticated',
    head: {
        titleTemplate: '%s - 后台管理中心'
    },
    components: { PersonInfoDialog, ChangePasswordDialog },
    data () {
        return {
            fullscreenLoading: false
        }
    },
    computed: {
        ...mapState({
            user: state => state.user || ''
        }),
        ...mapState('admin', ['branchs', 'currentBranch'])
    },
    methods: {
        async logout () {
            await this.$confirm('确认退出吗?', '提示')
            await this.$store.dispatch('logout')
            this.$router.push('/adminLogin')
        },
        async switchBranch (branch) {
            await this.$confirm(`确认切换到[${branch.name}]吗？`, '提示')
            this.fullscreenLoading = true
            try {
                await this.$store.dispatch('admin/switchBranch', branch)
                window.location.reload()
            } catch (e) {
                this.$message.error(e.message)
                this.fullscreenLoading = false
            }
        },
        scrollTop () {
            window.scrollTo(0, 0)
        },
        scrollBottom () {
            window.scrollTo(0, document.body.scrollHeight)
        }
    },
    mounted () {
        this.$store.dispatch('admin/getBranchs')
    }
}
</script>

<style lang="less" rel="stylesheet/less">
.admin-header {
    min-width: 1100px;
    width: 100%;
    line-height: 60px;
    background-color: #545c64;
    color: #ffffff;
    display: flex;
    padding: 0px;

    .logo {
        flex-grow: 0;
        flex-shrink: 0;
        height: 36px;
        padding: 12px 10px;
        width: 130px;
        // font-weight:bold;
        line-height: 18px;
        text-align: center;

        .logo-1 {
            float: left;
            width: 130px;
            font-size: 16px;
            font-weight: bold;
            letter-spacing: 4px;
        }

        .logo-2 {
            float: left;
            width: 130px;
            font-size: 15px;
            letter-spacing: 1px;
        }
    }
    .menu {
        flex-grow: 1;
        flex-shrink: 1;
    }
    .userinfo {
        flex-grow: 0;
        flex-shrink: 0;
        padding-right: 0px;

        .branch {
            color: #ffffff;
            margin-right: 14px;
        }
        .userinfo-inner {
            cursor: pointer;
            color: #ffffff;
            img {
                width: 40px;
                height: 40px;
                border-radius: 20px;
                margin: 10px;
                float: right;
            }
        }
    }
}
.left-menu {
    width: 150px;
    padding: 0px;

    .el-menu {
        height: 100%;

        .el-submenu .el-menu-item {
            min-width: 0;
        }
    }
}
.right-content {
    padding: 0px;

    .right-content-inner {
        padding: 10px 10px;
        min-width: 1430px;

        .toptool-right {
            float: right;
        }

        .toptool-left + .toptool-left {
            margin-left: 10px;
        }

        .toptool-right + .toptool-right {
            margin-right: 10px;
        }

        .toolbar {
            background: rgba(218, 218, 218, 0.28);
            padding: 10px;
            margin: 10px 0;
            min-height: 30px;

            .pager-block {
                float: right;
            }

            .pager-block + .selected {
                float: right;
                padding: 2px;
                font-size: 13px;
                height: 28px;
                line-height: 28px;
                font-weight: 400;
                color: #606266;
            }
        }
    }
}
.el-loading-mask {
    z-index: 999
}
.locate-button {
  z-index: 99999;
  position: fixed;
  right: 0;
  padding: 3px;
  width: 26px;
  line-height: 16px;
  border-right: none;
  white-space:normal
}
.locate-button-top {
  bottom: 150px;
  height: 72px;
}
.locate-button-bottom {
  bottom: 111px;
  height: 40px;
}
</style>
