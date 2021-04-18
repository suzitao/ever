<template>
    <div class="tag" :style="{ backgroundColor: color, width: width, height: height, fontSize: fontSize, lineHeight: height }">
        <slot></slot>
    </div>
</template>

<script>
export default {
    props: {
        color: {
            type: String,
            default: '#545c64'
        },
        width: {
            type: String
        },
        height: {
            type: String,
            default: '24px'
        },
        fontSize: {
            type: String,
            default: '12px'
        }
    }
}
</script>

<style lang="less" scoped>
.tag {
    color: #ffffff;
    display: inline-block;
    padding: 0 5px;
    text-align: center;
}
</style>
