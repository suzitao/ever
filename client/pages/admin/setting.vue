<template>
    <el-container>
        <el-aside width="150px" class="left-menu">
            <el-menu :default-active="$route.path" router>
                <el-menu-item index="/admin/setting/article">文章管理</el-menu-item>
                <el-menu-item index="/admin/setting/slider">广告管理</el-menu-item>
                <el-submenu index="1">
                    <template slot="title">基础资料</template>
                    <el-menu-item index="/admin/setting/branch">网点管理</el-menu-item>
                    <el-menu-item index="/admin/setting/line">线路管理</el-menu-item>
                    <el-menu-item index="/admin/setting/expressCompany">快递公司管理</el-menu-item>
                    <el-menu-item index="/admin/setting/exchangeRate">汇率维护</el-menu-item>
                    <el-menu-item index="/admin/setting/area">行政区划</el-menu-item>
                    <!--</el-menu-item-group>-->
                </el-submenu>
                <!--<el-menu-item index="/admin/setting/staff">员工管理</el-menu-item>-->
                <!--<el-menu-item index="3">导航三</el-menu-item>-->
            </el-menu>
        </el-aside>
        <el-main class="right-content" id="mainDiv">
            <a name="top" />
            <div class="right-content-inner">
                <nuxt-child></nuxt-child>
            </div>
            <a name="bottom" />
        </el-main>
    </el-container>
</template>
<script>
    export default {
        head: {
            title: '基础管理'
        }
    }
</script>
