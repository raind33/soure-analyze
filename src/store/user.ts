import { createStore, Module } from 'vuex4'

const userStore: Module<any, any> =  {
  namespaced: true,
  state: {
    a: 1232
  },
  getters: {
    b(state) {
      return state.a
    }
  },
  mutations: {
    setUserA(state, payload) {
      state.a = payload
    }
  },
  actions: {
    setUser( { commit }, payload) {
      debugger
      commit('setUserA', 777)
    }
  },
  modules: {
    userA: {
      state: {
        a: 1
      },
      getters: {
        d(state) {
          return state.a
        }
      },
      actions: {
        setUserA( { commit }) {
          commit('setA')
        }
      },
      namespaced: true
    }
  }
}
export default userStore