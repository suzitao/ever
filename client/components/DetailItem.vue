<template>
    <div>
        <div class="item-label" v-if="labelVisible">{{label}}</div>
        <div class="item-content">
            <slot></slot>
        </div>
    </div>
</template>
<style>
.item-label {
    width: 70px;
    text-align: left;
    vertical-align: middle;
    float: left;
    font-size: 14px;
    color: #989ba0;
    line-height: 1;
    padding: 11px 12px 11px 0;
    box-sizing: border-box;
}

.item-content {
    line-height: 36px;
    position: relative;
    font-size: 14px;
    color: #48576a;
}
</style>
<script>
export default {
    props: {
        label: String,
        labelVisible: {
            default: true
        }
    }
}
</script>