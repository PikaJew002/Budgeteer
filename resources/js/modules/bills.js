/*
|-------------------------------------------------------------------------------
| VUEX modules/bills.js
|-------------------------------------------------------------------------------
| The Vuex data store for the bills
*/

import BillAPI from '../api/bill.js';
import { objectToArray } from '../utils/main.js';
import Vue from 'vue';
import { cloneDeep } from 'lodash';

export const bills = {
  state: {
    bills: {},
    billsLoadStatus: 0,
    addBillStatus: 0,
    editBillStatus: 0,
    deleteBillStatus: 0,
  },
  actions: {
    loadBills({ commit, dispatch }, data) {
      commit('setBillsLoadStatus', 1);
      BillAPI.getBills(data)
        .then(res => {
          res.data.data.forEach(bill => {
            commit('insertBill', bill);
            dispatch('loadBillPaychecks', bill.paychecks.map(paycheck => paycheck.bill));
          });
          commit('setBillsLoadStatus', 2);
        })
        .catch(err => {
          console.log(err);
          commit('setBillsLoadStatus', 3);
        });
    },
    addBill({ commit }, bill) {
      commit('setAddBillStatus', 1);
      BillAPI.postBill(bill)
        .then(res => {
          commit('insertBill', res.data.data);
          commit('setAddBillStatus', 2);
        })
        .catch(err => {
          commit('setAddBillStatus', 3);
        });
    },
    editBill({ commit }, bill) {
      commit('setEditBillStatus', 1);
      BillAPI.putBill(bill)
        .then(res => {
          commit('updateBill', res.data.data);
          commit('setEditBillStatus', 2);
        })
        .catch(err => {
          commit('setEditBillStatus', 3);
        });
    },
    deleteBill({ commit, state, dispatch }, bill) {
      commit('setDeleteBillStatus', 1);
      BillAPI.deleteBill(bill.id)
        .then(res => {
          state.bill_paychecks.filter((bill_paycheck) => {
            return bill_paycheck.bill_id == res.data.data.id;
          }).forEach((bill_paycheck) => {
            dispatch('detachBillPaycheck', bill_paycheck);
          });
          commit('removeBill', res.data.data);
          commit('setDeleteBillStatus', 2);
        })
        .catch(err => {
          commit('setDeleteBillStatus', 3);
        });
    },
  },
  mutations: {
    setBillsLoadStatus(state, status) {
      state.billsLoadStatus = status;
    },
    setAddBillStatus(state, status) {
      state.addBillStatus = status;
    },
    setEditBillStatus(state, status) {
      state.editBillStatus = status;
    },
    setDeleteBillStatus(state, status) {
      state.deleteBillStatus = status;
    },
    insertBill(state, bill) {
      Vue.set(state.bills, bill.id, cloneDeep(bill));
    },
    updateBill(state, bill) {
      Vue.set(state.bills[bill.id], 'name', bill.name);
      Vue.set(state.bills[bill.id], 'amount', bill.amount);
      Vue.set(state.bills[bill.id], 'day_due_on', bill.day_due_on);
      Vue.set(state.bills[bill.id], 'start_on', bill.start_on);
      Vue.set(state.bills[bill.id], 'end_on', bill.end_on);
      Vue.set(state.bills[bill.id], 'created_at', bill.created_at);
      Vue.set(state.bills[bill.id], 'updated_at', bill.updated_at);
    },
    removeBill(state, bill) {
      Vue.delete(state.bills, bill.id);
    },
  },
  getters: {
    getBill: (state) => (id) => {
      return state.bills[id];
    },
    getBills(state) {
      return objectToArray(state.bills);
    },
    getBillsLoadStatus(state) {
      return state.billsLoadStatus;
    },
    getAddBillStatus(state) {
      return state.addBillStatus;
    },
    getEditBillStatus(state) {
      return state.editBillStatus;
    },
    getDeleteBillStatus(state) {
      return state.deleteBillStatus;
    }
  }
}
