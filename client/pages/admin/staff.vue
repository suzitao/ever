<template>
    <el-container>
        <el-aside width="150px" class="left-menu">
            <el-menu :default-active="$route.path" router>
                <el-menu-item index="/admin/staff/list">员工列表</el-menu-item>
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
            title: '员工管理'
        }
    }
</script>
