<template>
    <div class="el-row--flex">
        <el-tag 
            style="margin-right: 6px;"
            :key="tag" 
            v-for="(tag, idx) in value" 
            :closable="true" 
            :close-transition="false" 
            type="info"
            @close="handleClose(tag, idx)">{{tag}}</el-tag>
        <el-input
            style="width: auto;"
            v-if="inputVisible"
            v-model="inputValue"
            ref="saveTagInput"
            @keyup.enter.native="handleInputConfirm"
            @blur="handleInputConfirm"></el-input>
        <el-button 
            v-if="!inputVisible && value.length < max" 
            size="small"
            @click="showInput">{{label}}</el-button>
    </div>
</template>
<script>
    // 简单封装的[String]表单组件
    export default {
        props: {
            value: {
                type: Array,
                require: true
            },
            label: {
                type: String,
                default: '+ New Tag'
            },
            max: {
                type: Number,
                default: Number.MAX_VALUE
            }
        },
        data () {
            return {
                inputVisible: false,
                inputValue: ''
            }
        },
        methods: {
            handleClose (tag, idx) {
                this.value.splice(idx, 1)
                this.$emit('input', this.value)
            },
            handleInputConfirm () {
                if (this.inputValue) {
                    this.value.push(this.inputValue)
                    this.inputValue = ''
                    this.$emit('input', this.value)
                }
                this.inputVisible = false
            },
            showInput () {
                this.inputVisible = true
            }
        }
    }
</script>
