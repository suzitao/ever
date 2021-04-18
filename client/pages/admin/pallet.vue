<template>
    <el-container>
        <el-aside width="150px" class="left-menu">
            <el-menu :default-active="$route.path" router>
                <el-menu-item index="/admin/pallet/list">托盘查询</el-menu-item>
                <el-menu-item index="/admin/pallet/add">托盘创建</el-menu-item>
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
            title: '托盘管理'
        }
    }
</script>
