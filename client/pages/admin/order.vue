<template>
    <el-container>
        <el-aside width="150px" class="left-menu">
            <el-menu :default-active="$route.path" router>
                <!--<el-menu-item index="/admin/order/orderAll">全部运单</el-menu-item>-->
                <el-menu-item index="/admin/order/orderMatch">运单匹配</el-menu-item>
                <el-menu-item index="/admin/order/idCardUpload">上传证件</el-menu-item>
                <el-menu-item index="/admin/order/updateTrace">物流更新</el-menu-item>
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
            title: '运单处理'
        }
    }
</script>
