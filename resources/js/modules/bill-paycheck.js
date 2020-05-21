/*
|-------------------------------------------------------------------------------
| VUEX modules/incomes.js
|-------------------------------------------------------------------------------
| The Vuex data store for the incomes
*/

import BillPaycheckAPI from '../api/bill-paycheck.js';
import moment from 'moment';

export const bill_paycheck = {
  state: {
    attachBillPaycheckStatus: 0,
    modifyBillPaycheckStatus: 0,
    detachBillPaycheckStatus: 0,
  },
  actions: {
    attachBillPaycheck({ commit, dispatch }, data) {
      commit('setAttachBillPaycheckStatus', 1);
      dispatch('addBillPaycheck', data);
      dispatch('addIncomePaycheckBill', data);
      BillPaycheckAPI.postBillPaycheck(data.bill_paycheck)
        .then(res => {
          commit('setAttachBillPaycheckStatus', 2);
        })
        .catch(err => {
          commit('setAttachBillPaycheckStatus', 3);
        });
    },
    modifyBillPaycheck({ commit, dispatch }, data) {
      commit('setModifyBillPaycheckStatus', 1);
      dispatch('editBillPaycheckPivot', data);
      dispatch('editIncomePaycheckBillPivot', data);
      BillPaycheckAPI.putBillPaycheck(data.bill_paycheck)
        .then(res => {
          commit('setModifyBillPaycheckStatus', 2);
        })
        .catch(err => {
          commit('setModifyBillPaycheckStatus', 3);
        });
    },
    detachBillPaycheck({ commit, dispatch }, data) {
      commit('setDetachBillPaycheckStatus', 1);
      dispatch('deleteBillPaycheck', data);
      dispatch('deleteIncomePaycheckBill', data);
      BillPaycheckAPI.deleteBillPaycheck(data.bill_paycheck)
        .then(res => {
          commit('setDetachBillPaycheckStatus', 2);
        })
        .catch(err => {
          commit('setDetachBillPaycheckStatus', 3);
        });
    },
  },
  mutations: {
    setAttachBillPaycheckStatus(state, status) {
      state.attachBillPaycheckStatus = status;
    },
    setModifyBillPaycheckStatus(state, status) {
      state.modifyBillPaycheckStatus = status
    },
    setDetachBillPaycheckStatus(state, status) {
      state.detachBillPaycheckStatus = status;
    },
  },
  getters: {
    getAttachBillPaycheckStatus(state) {
      return state.attachBillPaycheckStatus;
    },
    getModifyBillPaycheckStatus(state) {
      return state.modifyBillPaycheckStatus;
    },
    getDetachBillPaycheckStatus(state) {
      return state.detachBillPaycheckStatus;
    },
  },
}
