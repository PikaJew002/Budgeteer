/*
|-------------------------------------------------------------------------------
| VUEX modules/paychecks.js
|-------------------------------------------------------------------------------
| The Vuex data store for the paychecks
*/

import PaycheckAPI from '../api/paycheck.js';

export const paychecks = {
  state: {
    paychecks: [],
    paychecksLoadStatus: 0,
    paycheck: {},
    paycheckLoadStatus: 0,
    addPaycheckStatus: 0,
    editPaycheckStatus: 0,
    deletePaycheckStatus: 0,
  },
  actions: {
    loadPaychecks({ commit }, data) {
      commit('setPaychecksLoadStatus', 1);
      PaycheckAPI.getPaychecks(data)
        .then(res => {
          commit('setPaychecks', res.data.data);
          commit('setPaychecksLoadStatus', 2);
        })
        .catch(err => {
          commit('setPaychecks', []);
          commit('setPaychecksLoadStatus', 3);
        });
    },
    loadPaycheck({ commit }, data) {
      commit('setPaycheckLoadStatus', 1);
      PaycheckAPI.getPaycheck(data.id)
        .then(res => {
          commit('setPaycheck', res.data.data);
          commit('setPaycheckLoadStatus', 2);
        })
        .catch(err => {
          commit('setPaycheck', {});
          commit('setPaycheckLoadStatus', 3);
        });
    },
    addPaycheck({ commit, state, dispatch }, paycheck) {
      commit('setAddPaycheckStatus', 1);
      dispatch('addIncomePaycheck', paycheck);
      PaycheckAPI.postPaycheck(paycheck)
        .then(res => {
          dispatch('addIncomePaycheckId', res.data.data);
          commit('setAddPaycheckStatus', 2);
        })
        .catch(err => {
          commit('setAddPaycheckStatus', 3);
        });
    },
    editPaycheck({ commit, state, dispatch }, paycheck) {
      commit('setEditPaycheckStatus', 1);
      for(let i in paycheck.bills) {
        dispatch('editBillPaycheck', {
          bill: paycheck.bills[i],
          paycheck: paycheck,
        });
      }
      for(let j in paycheck.contributions) {
        dispatch('editGoalContributionPaycheck', {
          contribution: paycheck.contributions[j],
          paycheck: paycheck,
        });
      }
      dispatch('editIncomePaycheck', paycheck);
      PaycheckAPI.putPaycheck(paycheck)
        .then(res => {
          commit('setEditPaycheckStatus', 2);
        })
        .catch(err => {
          commit('setEditPaycheckStatus', 3);
        });
    },
    deletePaycheck({ commit, state, dispatch }, paycheck) {
      commit('setDeletePaycheckStatus', 1);
      for(let i in paycheck.bills) {
        dispatch('deleteBillPaycheck', {
          bill: paycheck.bills[i],
          paycheck: paycheck,
        });
      }
      for(let j in paycheck.contributions) {
        dispatch('deleteGoalContributionPaycheck', {
          contribution: paycheck.contributions[j],
          paycheck: paycheck,
        });
      }
      dispatch('deleteIncomePaycheck', paycheck);
      PaycheckAPI.deletePaycheck(paycheck.id)
        .then(res => {
          commit('setDeletePaycheckStatus', 2);
        })
        .catch(err => {
          commit('setDeletePaycheckStatus', 3);
        });
    },
  },
  mutations: {
    setPaychecksLoadStatus(state, status) {
      state.paychecksLoadStatus = status;
    },
    setPaychecks(state, paychecks) {
      state.paychecks = paychecks;
    },
    setPaycheckLoadStatus(state, status) {
      state.paycheckLoadStatus = status;
    },
    setPaycheck(state, paycheck) {
      state.paycheck = paycheck;
    },
    setAddPaycheckStatus(state, status) {
      state.addPaycheckStatus = status;
    },
    setEditPaycheckStatus(state, status) {
      state.editPaycheckStatus = status;
    },
    setDeletePaycheckStatus(state, status) {
      state.deletePaycheckStatus = status;
    },
  },
  getters: {
    getPaychecksLoadStatus(state) {
      return state.paychecksLoadStatus;
    },
    getPaychecks(state) {
      return state.paychecks;
    },
    getPaycheckLoadStatus(state) {
      return state.paycheckLoadStatus;
    },
    getPaycheck(state) {
      return state.paycheck;
    },
    getAddPaycheckStatus(state) {
      return state.addPaycheckStatus;
    },
    getEditPaycheckStatus(state) {
      return state.editPaycheckStatus;
    },
    getDeletePaycheckStatus(state) {
      return state.deletePaycheckStatus;
    },
  },
}
