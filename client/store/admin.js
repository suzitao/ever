/**
 * Created by jim on 6/24/2017.
 */
import { httpGet, httpPost } from '~/plugins/axios'

export default function createModule () {
    return {
        namespaced: true,
        state: {
            branchs: null, // 店铺 Array
            currentBranch: null // 当前店铺id
        },
        actions: {
            async getBranchs ({ state, commit }) {
                const { branchRanges, currentBranch } = await httpGet('/api/admin/branchs/branchRanges')
                commit('SET_BRANCHS', { branchRanges, currentBranch })
            },
            async switchBranch ({ state, commit }, branch) {
                await httpPost(`/api/admin/branchs/switch/${branch._id}`)
                commit('SET_BRANCHS', {
                    branchRanges: state.branchs,
                    currentBranch: branch
                })
            }
        },
        mutations: {
            SET_BRANCHS (state, { branchRanges, currentBranch }) {
                state.branchs = branchRanges
                state.currentBranch = currentBranch
            }
        },
        getters: {
            currentBranch (state) {
                return state.currentBranch
            }
        }
    }
}
