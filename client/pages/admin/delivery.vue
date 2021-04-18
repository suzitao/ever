<template>
    <el-container>
        <el-aside width="150px" class="left-menu">
            <el-menu :default-active="$route.path" router>
                <!-- <el-menu-item index="/admin/delivery/orderAdd">运单新增</el-menu-item> -->
                <el-menu-item index="/admin/delivery/order/-10-90">运单查询</el-menu-item>
                <el-menu-item index="/admin/delivery/order/10">待称重运单</el-menu-item>
                <el-menu-item index="/admin/delivery/order/20">待付款运单</el-menu-item>
                <el-menu-item index="/admin/delivery/order/30">待入库运单</el-menu-item>
                <el-menu-item index="/admin/delivery/order/65">待支付关税</el-menu-item>
                <el-menu-item index="/admin/delivery/order/90">已取消运单</el-menu-item>
                <el-menu-item index="/admin/delivery/weigh">称重面板</el-menu-item>
                <el-menu-item index="/admin/delivery/batchWeigh">批量称重</el-menu-item>
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
            title: '发货管理'
        }
    }
</script>