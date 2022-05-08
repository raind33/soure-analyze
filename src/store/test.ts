import { createStore, Module } from 'vuex4'

const testStore: Module<any, any> =  {
  namespaced: true,
  state: {
    a: 1
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
  }
}
export default testStore