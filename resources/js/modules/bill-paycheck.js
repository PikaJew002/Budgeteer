/*
|-------------------------------------------------------------------------------
| VUEX modules/bill-paycheck.js
|-------------------------------------------------------------------------------
| The Vuex data store for the bill-paycheck associations
*/

import BillPaycheckAPI from '../api/bill-paycheck.js';
import { objectToArray } from '../utils/main.js';
import { cloneDeep } from 'lodash';

export const bill_paycheck = {
  state() {
    return {
      bill_paychecks: {},
      attachBillPaycheckStatus: 0,
      modifyBillPaycheckStatus: 0,
      detachBillPaycheckStatus: 0,
    };
  },
  actions: {
    loadBillPaychecks({ commit }, bill_paychecks) {
      bill_paychecks.forEach(bill_paycheck => {
        commit('insertBillPaycheck', bill_paycheck);
      });
    },
    async attachBillPaycheck({ commit }, bill_paycheck) {
      commit('setAttachBillPaycheckStatus', 1);
      await BillPaycheckAPI.postBillPaycheck(bill_paycheck)
        .then((res) => {
          commit('insertBillPaycheck', res.data.data)
          commit('setAttachBillPaycheckStatus', 2);
          return res.data.data;
        })
        .catch((err) => {
          commit('setAttachBillPaycheckStatus', 3);
          throw err;
        });
    },
    async modifyBillPaycheck({ commit }, bill_paycheck) {
      commit('setModifyBillPaycheckStatus', 1);
      await BillPaycheckAPI.putBillPaycheck(bill_paycheck)
        .then((res) => {
          commit('updateBillPaycheck', res.data.data);
          commit('setModifyBillPaycheckStatus', 2);
          return res.data.data;
        })
        .catch((err) => {
          commit('setModifyBillPaycheckStatus', 3);
          throw err;
        });
    },
    async detachBillPaycheck({ commit }, bill_paycheck) {
      commit('setDetachBillPaycheckStatus', 1);
      await BillPaycheckAPI.deleteBillPaycheck(bill_paycheck)
        .then((res) => {
          commit('removeBillPaycheck', res.data.data);
          commit('setDetachBillPaycheckStatus', 2);
          return res.data.data;
        })
        .catch((err) => {
          commit('setDetachBillPaycheckStatus', 3);
          throw err;
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
    insertBillPaycheck(state, bill_paycheck) {
      state.bill_paychecks[`${bill_paycheck.bill_id}_${bill_paycheck.paycheck_id}`] = cloneDeep(bill_paycheck);
    },
    updateBillPaycheck(state, bill_paycheck) {
      state.bill_paychecks[`${bill_paycheck.bill_id}_${bill_paycheck.paycheck_id}`]['amount'] = bill_paycheck.amount;
      state.bill_paychecks[`${bill_paycheck.bill_id}_${bill_paycheck.paycheck_id}`]['amount_project'] = bill_paycheck.amount_project;
      state.bill_paychecks[`${bill_paycheck.bill_id}_${bill_paycheck.paycheck_id}`]['due_on'] = bill_paycheck.due_on;
      state.bill_paychecks[`${bill_paycheck.bill_id}_${bill_paycheck.paycheck_id}`]['paid_on'] = bill_paycheck.paid_on;
      state.bill_paychecks[`${bill_paycheck.bill_id}_${bill_paycheck.paycheck_id}`]['created_at'] = bill_paycheck.created_at;
      state.bill_paychecks[`${bill_paycheck.bill_id}_${bill_paycheck.paycheck_id}`]['updated_at'] = bill_paycheck.updated_at;
    },
    removeBillPaycheck(state, bill_paycheck) {
      delete state.bill_paychecks[`${bill_paycheck.bill_id}_${bill_paycheck.paycheck_id}`];
    },
  },
  getters: {
    getBillPaycheck: (state) => (bill_id, paycheck_id) => {
      return state.bill_paychecks[`${bill_id}_${paycheck_id}`];
    },
    getBillPaychecks(state) {
      return objectToArray(state.bill_paychecks);
    },
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
