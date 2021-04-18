import Vue from 'vue'
import Vuex from 'vuex'
import adminModule from './admin'
import homeModule from './home'
import { httpPost } from '~/plugins/axios'
import { extend } from '~/plugins/tool'

const createStore = () => {
    return new Vuex.Store({
        modules: {
            admin: adminModule(),
            home: homeModule()
        },
        state: {
            clientHeight: 0,
            user: '',
            pageInfo: {} // key => { list, loading, total, pageNo, pageSize, pageSizes }
        },
        actions: {
            nuxtServerInit ({ commit }, { req }) {
                if (req.user) {
                    commit('SET_USER', req.user)
                }
            },
            async login ({ commit }, data/* { username, password, capcha, isAdmin } */) {
                const promise = data.isAdmin
                    ? httpPost('/api/admin/login', data)
                    : httpPost('/api/users/login', data)
                const user = await promise
                if (user) {
                    return commit('SET_USER', user)
                }
                throw new Error('登录失败')
            },
            async logout ({ commit }) {
                await httpPost('/api/users/logout')
                commit('SET_USER', '')
            },
            async register ({ commit }, data) {
                await httpPost('/api/users/register', data)
            },
            async personalInformation ({ commit }, params) {
                const user = await httpPost('/api/users/personalInformation', params)
                commit('SET_USER', user)
            },
            setClientHeight ({ commit }) {
                commit('SET_CLIENT_HEIGHT', document.documentElement.clientHeight)
            }
        },
        mutations: {
            SET_USER (state, user) {
                state.user = user
            },
            SET_PAGEINFO (state, { key, object = {} } = {}) {
                Vue.set(state.pageInfo, key, extend(state.pageInfo[key] || {}, object))
            },
            SET_CLIENT_HEIGHT (state, clientHeight) {
                state.clientHeight = clientHeight
            }
        }
    })
}

export default createStore
