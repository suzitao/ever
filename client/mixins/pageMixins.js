
/**
 * 封装分页、搜索用到的字段和常用函数
 *
 * 需要实现：
 * onQueryList(params)
 * onRowDelete(row, index)
 */
import { extend, deepCopy } from '~/plugins/tool'

export const globalPageSizes = [10, 15, 30, 50, 100, 200, 300, 600, 1200]

export const pageMethods = {
    async queryList (pageNo = 1) {
        try {
            this.list = []
            this.loading = true
            const params = {
                pageNo,
                pageSize: this.pageSize,
                sort: JSON.stringify(this.sortOptions)
            }
            extend(params, this.searchForm)
            this.pageNo = pageNo
            if (this.pageSize <= 1000) {
                const { list, total } = await this.onQueryList(params)
                this.list = list
                this.total = total
            } else {
                const paramsList = []
                for (let i = ((this.pageSize / 50) * (pageNo - 1) + 1); i <= ((this.pageSize * pageNo) / 50); i++) {
                    const tempParams = deepCopy(params)
                    tempParams.pageSize = 50
                    tempParams.pageNo = i
                    paramsList.push(tempParams)
                }
                const result = await Promise.all(paramsList.map(async tempParams => {
                    const { list, total } = await this.onQueryList(tempParams)
                    this.total = total
                    return list
                }))
                let tempList = []
                result.forEach(list => {
                    tempList = tempList.concat(list)
                })
                this.list = tempList
            }
            if (this.afterDataQuery) {
                this.afterDataQuery()
            }
        } catch (e) {
            this.$message.error(e.message)
        } finally {
            this.loading = false
        }
    },
    handleSizeChange (pageSize) {
        this.pageSize = pageSize
        if (window.localStorage) {
            window.localStorage.setItem('pageSize', pageSize)
        }
        this.queryList()
    },
    handleCurrentChange (pageNo) {
        this.queryList(pageNo)
    },
    async handleDel (index, row) {
        try {
            this.loading = true
            await this.onRowDelete(row, index)
            this.$message.success('操作成功')
            this.list.splice(index, 1)
            this.total--
        } catch (e) {
            this.$message.error(e.message)
        } finally {
            this.loading = false
        }
    },
    async handleEnable (index, row) {
        try {
            this.loading = true
            await this.onRowEnable(row, index)
            this.$message.success('操作成功')
            row.status = 0
        } catch (e) {
            this.$message.error(e.message)
        } finally {
            this.loading = false
        }
    },
    async handleDisable (index, row) {
        try {
            this.loading = true
            await this.onRowDisable(row, index)
            this.$message.success('操作成功')
            row.status = 1
        } catch (e) {
            this.$message.error(e.message)
        } finally {
            this.loading = false
        }
    },
    search () {
        this.searchForm.mixSearch = this.searchFormInput.mixSearch
        this.queryList()
    },
    handleSortChange ({ order, prop }) {
        this.sortOptions = prop ? {
            [prop]: order
        } : {}
        this.queryList()
    }
}

export default function create ({ pageSizes = globalPageSizes, pageSize = 30 } = {}) {
    return {
        data () {
            return {
                list: [],
                loading: false,
                total: 0,
                pageNo: 1,
                pageSize,
                pageSizes,
                sortOptions: {},

                searchFormInput: {
                    mixSearch: ''
                },
                searchForm: {
                    mixSearch: ''
                }
            }
        },
        methods: pageMethods
    }
}
