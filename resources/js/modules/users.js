/*
|-------------------------------------------------------------------------------
| VUEX modules/users.js
|-------------------------------------------------------------------------------
| The Vuex data store for the users
*/

import UserAPI from '../api/user.js';

export const users = {
  state() {
    return {
      user: null,
      userLoadStatus: 0, // 0 is not loaded, 1 is pending, 2 is loaded, 3 is error loading
      collapse: null,
    };
  },
  actions: {
    loadUser: async function({ commit }) {
      commit('setUserLoadStatus', 1);
      return UserAPI.getUser()
        .then((res) => {
          commit('setUser', res.data.data);
          commit('setUserLoadStatus', 2);
          return { success: true, errors: {} };
        })
        .catch((err) => {
          commit('setUser', {});
          commit('setUserLoadStatus', 3);
          throw err;
        });
    },
    loginUser: async function({ dispatch }, credentials) {
      return UserAPI.login(credentials.email, credentials.password, credentials.remember)
        .then((result) => {
          if(result.success) {
            return dispatch('loadUser');
          }
          return result;
        });
    },
    logoutUser: async function ({ commit }) {
      return UserAPI.logout()
        .then((successful) => {
          if (successful) {
            commit('setUserLoadStatus', 0);
            commit('setUser', null);
          }
          return successful;
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
