import { createStore } from '../../vuex4'
import user from './user'
import test from './testStore'

export default createStore({
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
  },
  modules: {
    user,
    test
  }
})