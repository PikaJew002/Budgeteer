/*
|-------------------------------------------------------------------------------
| VUEX modules/paychecks.js
|-------------------------------------------------------------------------------
| The Vuex data store for the paychecks
*/

import PaycheckAPI from '../api/paycheck.js';
import { objectToArray } from '../utils/main.js';
import Vue from 'vue';
import { cloneDeep } from 'lodash';

export const paychecks = {
  state: {
    paychecks: {},
    paychecksLoadStatus: 0,
    addPaycheckStatus: 0,
    editPaycheckStatus: 0,
    deletePaycheckStatus: 0,
  },
  actions: {
    loadPaychecks({ commit }, data) {
      commit('setPaychecksLoadStatus', 1);
      PaycheckAPI.getPaychecks(data)
        .then(res => {
          res.data.data.forEach(paycheck => {
            commit('insertPaycheck', paycheck);
          });
          commit('setPaychecksLoadStatus', 2);
        })
        .catch(err => {
          commit('insertPaychecks', {});
          commit('setPaychecksLoadStatus', 3);
        });
    },
    addPaycheck({ commit, state, dispatch }, paycheck) {
      commit('setAddPaycheckStatus', 1);
      PaycheckAPI.postPaycheck(paycheck)
        .then(res => {
          commit('insertPaycheck', res.data.data);
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
      commit('updatePaycheck', paycheck);
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
      commit('removePaycheck', paycheck);
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
    insertPaycheck(state, paycheck) {
      Vue.set(state.paychecks, paycheck.id, cloneDeep(paycheck));
    },
    setPaycheckLoadStatus(state, status) {
      state.paycheckLoadStatus = status;
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
    updatePaycheck(state, paycheck) {
      Vue.set(state.paychecks[paycheck.id], 'amount', paycheck.amount);
      Vue.set(state.paychecks[paycheck.id], 'amount_project', paycheck.amount_project);
      Vue.set(state.paychecks[paycheck.id], 'notify_when_paid', paycheck.notify_when_paid);
      Vue.set(state.paychecks[paycheck.id], 'paid_on', paycheck.paid_on);
      Vue.set(state.paychecks[paycheck.id], 'created_at', paycheck.created_at);
      Vue.set(state.paychecks[paycheck.id], 'updated_at', paycheck.updated_at);
    },
    removePaycheck(state, paycheck) {
      Vue.delete(state.paychecks, paycheck.id);
    },
  },
  getters: {
    /**
     * @param id int
     * @return object
     */
    getPaycheck: (state) => (id) => {
      return state.paychecks[id];
    },
    /**
     * @return array
     */
    getPaychecks(state) {
      return objectToArray(state.paychecks);
    },
    getPaychecksLoadStatus(state) {
      return state.paychecksLoadStatus;
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
