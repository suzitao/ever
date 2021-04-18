<template>
    <el-input :placeholder="placeholder" :disabled="true" :size="size">
        <el-button type="primary" :disabled="disabled" :size="size" @click="handleClick(false)" slot="prepend">- {{step}}</el-button>
        <el-button type="primary" :disabled="disabled" :size="size" @click="handleClick(true)" slot="append">+ {{step}}</el-button>
    </el-input>
</template>
<script>
export default {
    props: {
        value: {
            type: Number
        },
        min: {
            type: Number,
            default: 0
        },
        step: {
            type: Number,
            default: 1
        },
        placeholder: {
            type: String
        },
        size: {
            type: String,
            default: 'large'
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        handleClick (add) {
            const value = add ? (this.value + this.step) : Math.max(this.value - this.step, this.min)
            this.$emit('input', value)
        }
    }
}
</script>

