import Vue from 'vue'
import { httpGet, httpPost } from '~/plugins/axios'

export default function createModule () {
    return {
        namespaced: true,
        state: {
            order: {} // order._id => order
        },
        actions: {
            // 获取订单列表
            async getOrders ({ state, commit }, params) {
                const data = await httpGet('/api/users/orders', params)
                commit('SET_ORDERS', data.list)
                return data
            },
            // 获取订单
            async getOrder ({ state, commit }, id) {
                if (state.order[id]) {
                    return state.order[id]
                }
                const data = await httpGet(`/api/users/orders/${id}`)
                if (!data) {
                    throw new Error('运单不存在')
                }
                commit('SET_ORDERS', [data])
                return data
            },
            // 新增订单
            async addOrder (store, data) {
                await httpPost('/api/users/orders', data)
            },
            // 修改订单
            async updateOrder ({ commit, state }, { id, data }) {
                const resData = await httpPost(`/api/users/orders/${id}`, data)
                commit('SET_ORDERS', [resData])
                return resData
            }
        },
        mutations: {
            SET_ORDERS (state, list) {
                list.forEach(order => {
                    Vue.set(state.order, order._id, order)
                })
            }
        },
        getters: {
        }
    }
}
