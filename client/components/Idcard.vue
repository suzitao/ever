<template>
    <div>
        <el-popover placement="top-start" trigger="hover" v-if="value">
            <img :src="'/api/files/' + value" style="width: 140px;" />
            <a :href="'/api/files/' + value + '?fileName=' + fileName" v-if="value" slot="reference"><slot></slot></a>
        </el-popover>
        <!-- <span v-if="value.idCardBackImg && value.idCardPositiveImg"> | </span>
        <el-popover placement="top-start" trigger="hover" v-if="value.idCardPositiveImg">
            <img :src="'/api/files/' + value.idCardPositiveImg" style="width: 140px;" v-if="value.idCardPositiveImg" />
            <a :href="'/api/files/' + value.idCardPositiveImg" slot="reference">反面</a>
        </el-popover> -->
    </div>
</template>
<script>
export default {
    props: {
        value: '',
        fileName: ''
    }
}
</script>
