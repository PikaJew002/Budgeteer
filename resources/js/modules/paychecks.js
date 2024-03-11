/*
|-------------------------------------------------------------------------------
| VUEX modules/paychecks.js
|-------------------------------------------------------------------------------
| The Vuex data store for the paychecks
*/

import PaycheckAPI from '../api/paycheck.js';
import { objectToArray } from '../utils/main.js';
import { cloneDeep } from 'lodash';

export const paychecks = {
  state() {
    return {
      paychecks: {},
      paychecksLoadStatus: 0,
      addPaycheckStatus: 0,
      editPaycheckStatus: 0,
      deletePaycheckStatus: 0,
    };
  },
  actions: {
    loadPaychecks({ commit }, options) {
      commit('setPaychecksLoadStatus', 1);
      PaycheckAPI.getPaychecks(options)
        .then((res) => res.data.data)
        .then((paychecks) => {
          paychecks.forEach(paycheck => {
            commit('insertPaycheck', paycheck);
          });
          commit('setPaychecksLoadStatus', 2);
        })
        .catch((err) => {
          commit('setPaychecksLoadStatus', 3);
          throw err;
        });
    },
    async addPaycheck({ commit }, paycheck) {
      commit('setAddPaycheckStatus', 1);
      await PaycheckAPI.postPaycheck(paycheck)
        .then((res) => {
          commit('insertPaycheck', res.data.data);
          commit('setAddPaycheckStatus', 2);
          return res.data.data;
        })
        .catch((err) => {
          commit('setAddPaycheckStatus', 3);
          throw err;
        });
    },
    async editPaycheck({ commit }, paycheck) {
      commit('setEditPaycheckStatus', 1);
      await PaycheckAPI.putPaycheck(paycheck)
        .then((res) => {
          commit('updatePaycheck', res.data.data);
          commit('setEditPaycheckStatus', 2);
          return res.data.data;
        })
        .catch((err) => {
          commit('setEditPaycheckStatus', 3);
          throw err;
        });
    },
    async deletePaycheck({ commit, dispatch, getters }, paycheck_id) {
      commit('setDeletePaycheckStatus', 1);
      // delete BillPaychecks before deleting Paycheck
      await Promise.all(getters.getBillPaychecks.filter((bill_paycheck) => {
        return bill_paycheck.paycheck_id === paycheck_id;
      }).map(async (bill_paycheck) => {
        return await dispatch('detachBillPaycheck', bill_paycheck);
      }));
      await PaycheckAPI.deletePaycheck(paycheck_id)
        .then((res) => {
          commit('removePaycheck', res.data.data);
          commit('setDeletePaycheckStatus', 2);
          return res.data.data;
        })
        .catch((err) => {
          commit('setDeletePaycheckStatus', 3);
          throw err;
        });
    },
  },
  mutations: {
    setPaychecksLoadStatus(state, status) {
      state.paychecksLoadStatus = status;
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
    insertPaycheck(state, paycheck) {
      state.paychecks[paycheck.id] = cloneDeep(paycheck);
    },
    updatePaycheck(state, paycheck) {
      state.paychecks[paycheck.id].amount = paycheck.amount;
      state.paychecks[paycheck.id].amount_project = paycheck.amount_project;
      state.paychecks[paycheck.id].notify_when_paid = paycheck.notify_when_paid;
      state.paychecks[paycheck.id].paid_on = paycheck.paid_on;
      state.paychecks[paycheck.id].created_at = paycheck.created_at;
      state.paychecks[paycheck.id].updated_at = paycheck.updated_at;
    },
    removePaycheck(state, paycheck) {
      delete state.paychecks[paycheck.id];
    },
  },
  getters: {
    getPaycheck: (state) => (id) => {
      return state.paychecks[id];
    },
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
