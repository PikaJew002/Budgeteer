/*
|-------------------------------------------------------------------------------
| VUEX modules/bills.js
|-------------------------------------------------------------------------------
| The Vuex data store for the bills
*/

import Vue from 'vue';
import { cloneDeep } from 'lodash';
import BillAPI from '../api/bill.js';

export const bills = {
  state: {
    bills: [],
    billsLoadStatus: 0,
    bill: {},
    billLoadStatus: 0,
    addBillStatus: 0,
    editBillStatus: 0,
    deleteBillStatus: 0,
  },
  actions: {
    loadBills({ commit }, data) {
      commit('setBillsLoadStatus', 1);
      BillAPI.getBills(data)
        .then(res => {
          commit('setBills', res.data.data);
          commit('setBillsLoadStatus', 2);
        })
        .catch(err => {
          commit('setBills', []);
          commit('setBillsLoadStatus', 3);
        });
    },
    loadBill({ commit }, bill) {
      commit('setBillLoadStatus', 1);
      BillAPI.getBill(bill.id)
        .then(res => {
          commit('setBill', res.data.data);
          commit('setBillLoadStatus', 2);
        })
        .catch(err => {
          commit('setBill', {});
          commit('setBillLoadStatus', 3);
        });

    },
    addBill({ commit, state, dispatch }, bill) {
      commit('setAddBillStatus', 1);
      commit('insertBill', bill);
      BillAPI.postBill(bill)
        .then(res => {
          commit('setAddBillStatus', 2);
        })
        .catch(err => {
          commit('setAddBillStatus', 3);
        });
    },
    editBill({ commit, state, dispatch }, bill) {
      commit('setEditBillStatus', 1);
      for(let i in bill.paychecks) {
        dispatch('editIncomePaycheckBill', {
          paycheck: bill.paychecks[i], bill: bill,
        });
      }
      commit('updateBill', bill);
      BillAPI.putBill(bill)
        .then(res => {
          commit('setEditBillStatus', 2);
        })
        .catch(err => {
          commit('setEditBillStatus', 3);
        });
    },
    deleteBill({ commit, state, dispatch }, bill) {
      commit('setDeleteBillStatus', 1);
      for(let i in bill.paychecks) {
        dispatch('deleteIncomePaycheckBill', {
          paycheck: bill.paychecks[i],
          bill: bill,
        });
      }
      commit('removeBill', bill);
      BillAPI.deleteBill(bill.id)
        .then(res => {
          commit('setDeleteBillStatus', 2);
        })
        .catch(err => {
          commit('setDeleteBillStatus', 3);
        });
    },
    addBillPaycheck({ commit, state }, data) {
      commit('insertBillPaycheck', data);
    },
    editBillPaycheck({ commit, state }, data) {
      commit('updateBillPaycheck', data);
    },
    editBillPaycheckPivot({ commit, state }, data) {
      commit('updateBillPaycheckPivot', data);
    },
    deleteBillPaycheck({ commit, state }, data) {
      commit('removeBillPaycheck', data);
    },
  },
  mutations: {
    setBillsLoadStatus(state, status) {
      state.billsLoadStatus = status;
    },
    setBills(state, bills) {
      state.bills = bills;
    },
    setBillLoadStatus(state, status) {
      state.billLoadStatus = status;
    },
    setBill(state, bill) {
      state.bill = bill;
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
      state.bills.push(bill);
    },
    updateBill(state, bill) {
      for(let i in state.bills) {
        if(state.bills[i].id == bill.id) {
          Vue.set(state.bills, i, bill);
          return;
        }
      }
    },
    removeBill(state, bill) {
      for(let i in state.bills) {
        if(state.bills[i].id == bill.id) {
          state.bills.splice(i, 1);
          return;
        }
      }
    },
    insertBillPaycheck(state, data) {
      let paycheckClone = cloneDeep(data.paycheck);
      for(let i in state.bills) {
        if(state.bills[i].id == data.bill.id) {
          paycheckClone['pivot_amount'] = data.bill_paycheck.amount;
          paycheckClone['pivot_amount_project'] = data.bill_paycheck.amount_project;
          paycheckClone['pivot_due_on'] = data.bill_paycheck.due_on;
          paycheckClone['pivot_paid_on'] = data.bill_paycheck.paid_on;
          state.bills[i].paychecks.push(paycheckClone);
          return;
        }
      }
    },
    updateBillPaycheck(state, data) {
      for(let i in state.bills) {
        if(state.bills[i].id == data.bill.id) {
          for(let j in state.bills[i].paychecks) {
            if(state.bills[i].paychecks[j].id == data.paycheck.id) {
              Vue.set(state.bills[i].paychecks[j], 'amount', data.paycheck.amount);
              Vue.set(state.bills[i].paychecks[j], 'amount_project', data.paycheck.amount_project);
              Vue.set(state.bills[i].paychecks[j], 'notify_when_paid', data.paycheck.notify_when_paid);
              Vue.set(state.bills[i].paychecks[j], 'paid_on', data.paycheck.paid_on);
              return;
            }
          }
        }
      }
    },
    updateBillPaycheckPivot(state, data) {
      for(let i in state.bills) {
        if(state.bills[i].id == data.bill.id) {
          for(let j in state.bills[i].paychecks) {
            if(state.bills[i].paychecks[j].id == data.paycheck.id) {
              Vue.set(state.bills[i].paychecks[j], 'pivot_amount', data.bill_paycheck.amount);
              Vue.set(state.bills[i].paychecks[j], 'pivot_amount_project', data.bill_paycheck.amount_project);
              Vue.set(state.bills[i].paychecks[j], 'pivot_due_on', data.bill_paycheck.due_on);
              Vue.set(state.bills[i].paychecks[j], 'pivot_paid_on', data.bill_paycheck.paid_on);
              return;
            }
          }
        }
      }
    },
    removeBillPaycheck(state, data) {
      for(let i in state.bills) {
        if(state.bills[i].id == data.bill.id) {
          for(let j in state.bills[i].paychecks) {
            if(state.bills[i].paychecks[j].id == data.paycheck.id) {
              state.bills[i].paychecks.splice(j, 1);
              return;
            }
          }
        }
      }
    },
  },
  getters: {
    getBillsLoadStatus(state) {
      return state.billsLoadStatus;
    },
    getBills(state) {
      return state.bills;
    },
    getBillLoadStatus(state) {
      return state.billLoadStatus;
    },
    getBill(state){
      return state.bill;
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
