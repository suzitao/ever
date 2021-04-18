<template>
    <div>
        <div class="left-menu">
            <el-menu :default-active="$route.path" router>
                <el-menu-item index="/admin/workspace">工作台</el-menu-item>
                <!--<el-menu-item index="/admin/news">系统公告</el-menu-item>-->
            </el-menu>
        </div>
        <nuxt-child class="right-content"></nuxt-child>
    </div>
</template>
<script>
    export default {
        head: {
            title: '工作台'
        }
    }
</script>
