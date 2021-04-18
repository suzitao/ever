<template>
    <div>
        <el-autocomplete v-model="inputValue" 
            :fetch-suggestions="querySearch"
            valueKey="name"
            :placeholder="placeholder" 
            @select="handleSelect"
            icon="el-icon-search"
        ></el-autocomplete>
    </div>
</template>
<script>
import { httpGet } from '~/plugins/axios'
/**
 * 联系人选择组件
 * */
export default {
    props: {
        value: {
            type: String
        },
        contactsType: {
            type: Number
        },
        placeholder: {
            type: String,
            default: '请输入内容'
        }
    },
    computed: {
        inputValue: {
            set (newValue) {
                this.$emit('input', newValue)
            },
            get () {
                return this.value
            }
        }
    },
    methods: {
        async querySearch (queryString, callback) {
            const params = {
                pageNo: 1,
                pageSize: 30
            }
            if (queryString) {
                params.mixSearch = queryString
            }

            if (typeof this.contactsType !== 'undefined') {
                params.contactsType = this.contactsType
            }
            const { list } = await httpGet('/api/users/contacts', params)
            callback(list)
        },
        handleSelect (item) {
            this.$emit('select', item)
        }
    }
}
</script>
