/*
|-------------------------------------------------------------------------------
| VUEX modules/bills.js
|-------------------------------------------------------------------------------
| The Vuex data store for the bills
*/

import BillAPI from '../api/bill.js';
import { objectToArray } from '../utils/main.js';
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
    loadBills({ commit, dispatch }, options) {
      commit('setBillsLoadStatus', 1);
      BillAPI.getBills(options)
        .then((res) => res.data.data)
        .then((bills) => {
          bills.forEach(bill => {
            commit('insertBill', bill);
            dispatch('loadBillPaychecks', bill.paychecks.map(paycheck => paycheck.bill));
          });
          commit('setBillsLoadStatus', 2);
        })
        .catch((err) => {
          commit('setBillsLoadStatus', 3);
          throw err;
        });
    },
    async addBill({ commit }, bill) {
      commit('setAddBillStatus', 1);
      await BillAPI.postBill(bill)
        .then((res) => {
          commit('insertBill', res.data.data);
          commit('setAddBillStatus', 2);
          return res.data.data;
        })
        .catch((err) => {
          commit('setAddBillStatus', 3);
          throw err;
        });
    },
    async editBill({ commit }, bill) {
      commit('setEditBillStatus', 1);
      await BillAPI.putBill(bill)
        .then((res) => {
          commit('updateBill', res.data.data);
          commit('setEditBillStatus', 2);
          return res.data.data;
        })
        .catch((err) => {
          commit('setEditBillStatus', 3);
          throw err;
        });
    },
    async deleteBill({ commit, dispatch, getters }, bill) {
      commit('setDeleteBillStatus', 1);
      // delete BillPaychecks before deleting Bill
      await Promise.all(getters.getBillPaychecks.filter((bill_paycheck) => {
        return bill_paycheck.bill_id === bill.id;
      }).map(async (bill_paycheck) => {
        return await dispatch('detachBillPaycheck', bill_paycheck);
      }));
      await BillAPI.deleteBill(bill.id)
        .then((res) => {
          commit('removeBill', res.data.data);
          commit('setDeleteBillStatus', 2);
          return res.data.data;
        })
        .catch((err) => {
          commit('setDeleteBillStatus', 3);
          throw err;
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
      state.bills[bill.id] = cloneDeep(bill);
    },
    updateBill(state, bill) {
      state.bills[bill.id].name = bill.name;
      state.bills[bill.id].amount = bill.amount;
      state.bills[bill.id].day_due_on = bill.day_due_on;
      state.bills[bill.id].start_on = bill.start_on;
      state.bills[bill.id].end_on = bill.end_on;
      state.bills[bill.id].created_at = bill.created_at;
      state.bills[bill.id].updated_at = bill.updated_at;
    },
    removeBill(state, bill) {
      delete state.bills[bill.id];
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
