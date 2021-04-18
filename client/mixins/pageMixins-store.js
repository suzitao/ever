
/**
 * 封装分页、搜索用到的字段和常用函数
 * 使用vuex中 state.pageInfo[key]储存分页内容
 *
 * 需要实现：
 * onQueryList(params)
 * onRowDelete(row, index)
 */
import { mapState } from 'vuex'
import { extend } from '~/plugins/tool'
import { globalPageSizes, pageMethods } from './pageMixins'

function mapPageInfo (object) {
    const result = {}
    Object.keys(object).forEach(key => {
        result[key] = {
            get () {
                if (this.pageInfo && this.pageInfo.hasOwnProperty(key)) {
                    return this.pageInfo[key]
                }
                return object[key]
            },
            set (value) {
                let o = {
                    [key]: value
                }
                if (!this.pageInfo) {
                    o = extend(object, o)
                }
                this.$store.commit('SET_PAGEINFO', { key: this.key, object: o })
            }
        }
    })
    return result
}

// keyFun 映射state.pageInfo的key
export default function create ({ keyFun, pageSizes = globalPageSizes } = {}) {
    return {
        data () {
            return {
                searchForm: {
                    mixSearch: ''
                },

                searchFormInput: {
                    mixSearch: ''
                }
            }
        },
        computed: {
            key () {
                return keyFun(this)
            },
            ...mapState({
                pageInfo (state) {
                    return state.pageInfo[this.key]
                }
            }),
            ...mapPageInfo({
                list: [],
                loading: false,
                total: 0,
                pageNo: 1,
                pageSize: 30,
                pageSizes,
                sortOptions: {}
            })
        },
        methods: pageMethods
    }
}
