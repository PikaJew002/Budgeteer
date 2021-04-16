/*
|-------------------------------------------------------------------------------
| VUEX modules/users.js
|-------------------------------------------------------------------------------
| The Vuex data store for the users
*/

import UserAPI from '../api/user.js';

export const users = {
  state: {
    user: {},
    userLoadStatus: 0
  },
  actions: {
    loadUser({ commit }) {
      commit('setUserLoadStatus', 1);
      UserAPI.getUser()
        .then(res => {
          commit('setUser', res.data.data);
          commit('setUserLoadStatus', 2);
        })
        .catch(err => {
          commit('setUser', {});
          commit('setUserLoadStatus', 3);
        });
    },
  },
  mutations: {
    setUserLoadStatus(state, status) {
      state.userLoadStatus = status;
    },
    setUser(state, user) {
      state.user = user;
    },
  },
  getters: {
    getUserLoadStatus(state) {
      return function() {
        return state.userLoadStatus;
      }
    },
    getUser(state) {
      return state.user;
    },
  },
}
