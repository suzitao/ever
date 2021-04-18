<template>
    <div class="g-rotate-bar">
        <el-button @click="rotateLeft">向右翻转</el-button>
        <el-button @click="rotateRight">向左翻转</el-button>
    </div>
</template>

<style>
.g-rotate-bar {
    position: absolute;
    bottom: 30px;
    left: 0;
    right: 0;
    text-align: center;
}

.g-rotate-bar .svg-icon {
    display: inline-block;
    width: 1.2em;
    height: 1.2em;
    margin: 0 2em;
}
</style>

<script>
export default {
    data () {
        return {
            rotateDegree: 0
        }
    },

    methods: {
        rotateRight () {
            this.rotateDegree += 90
            this.$emit('rotate', this.rotateDegree)
        },

        rotateLeft () {
            this.rotateDegree -= 90
            this.$emit('rotate', this.rotateDegree)
        }
    }
}
</script>
