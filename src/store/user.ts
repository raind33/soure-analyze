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
    setA(state, payload) {
      state.a = payload
    }
  },
  actions: {
    getData( { commit }) {
      commit('setA')
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
      namespaced: true
    }
  }
}
export default userStore