/*
|-------------------------------------------------------------------------------
| VUEX modules/incomes.js
|-------------------------------------------------------------------------------
| The Vuex data store for the incomes
*/

import IncomeAPI from '../api/income.js';
import Vue from 'vue';
import { cloneDeep } from 'lodash';
import moment from 'moment';

export const incomes = {
  state: {
    incomes: [],
    incomesLoadStatus: 0,
    income: {},
    incomeLoadStatus: 0,
    addIncomeStatus: 0,
    addIncomeErr: "",
    editIncomeStatus: 0,
    editIncomeErr: "",
    deleteIncomeStatus: 0
  },
  actions: {
    loadIncomes({ commit }, options) {
      commit('setIncomesLoadStatus', 1);
      IncomeAPI.getIncomes(options)
        .then(res => {
          commit('setIncomes', res.data.data);
          commit('setIncomesLoadStatus', 2);
        })
        .catch(err => {
          commit('setIncomes', []);
          commit('setIncomesLoadStatus', 3);
        });
    },
    loadIncome({ commit }, income) {
      commit('setIncomeLoadStatus', 1);
      IncomeAPI.getIncome(income.id)
        .then(res => {
          commit('setIncome', res.data.data);
          commit('setIncomeLoadStatus', 2);
        })
        .catch(err => {
          commit('setIncome', {});
          commit('setIncomeLoadStatus', 3);
        });
    },
    addIncome({ commit, state, dispatch }, income) {
      commit('setAddIncomeStatus', 1);
      commit('insertIncome', income);
      IncomeAPI.postIncome(income)
        .then(res => {
          commit('setAddIncomeStatus', 2);
        })
        .catch(err => {
          commit('setAddIncomeStatus', 3);
        });
    },
    editIncome({ commit, state, dispatch }, income) {
      commit('setEditIncomeStatus', 1);
      commit('updateIncome', income);
      IncomeAPI.putIncome(income)
        .then(res => {
          commit('setEditIncomeStatus', 2);
        })
        .catch(err => {
          commit('setEditIncomeStatus', 3);
        });
    },
    deleteIncome({ commit, state, dispatch }, income) {
      commit('setDeleteIncomeStatus', 1);
      for(let i in income.paychecks) {
        for(let j in income.paychecks[i].bills) {
          dispatch('deleteBillPaycheck', {
            bill: income.paychecks[i].bills[j],
            paycheck: income.paychecks[i],
          });
        }
        for(let k in income.paychecks[i].contributions) {
          // TODO
          //dispatch('deleteGoalContributionPaycheck', income.paychecks[i].contributions[j].id, income.paychecks[i]);
        }
      }
      commit('removeIncome', income);
      IncomeAPI.deleteIncome(income.id)
        .then(res => {
          commit('setDeleteIncomeStatus', 2);
        })
        .catch(err => {
          commit('setDeleteIncomeStatus', 3);
        });
    },
    addIncomePaycheck({ commit, state }, paycheck) {
      commit('insertIncomePaycheck', paycheck);
    },
    editIncomePaycheck({ commit, state }, paycheck) {
      commit('updateIncomePaycheck', paycheck);
    },
    deleteIncomePaycheck({ commit, state }, paycheck) {
      commit('removeIncomePaycheck', paycheck);
    },
    addIncomePaycheckBill({ commit, state }, data) {
      commit('insertIncomePaycheckBill', data);
    },
    editIncomePaycheckBill({ commit, state }, data) {
      commit('updateIncomePaycheckBill', data);
    },
    editIncomePaycheckBillPivot({ commit, state }, data) {
      commit('updateIncomePaycheckBillPivot', data);
    },
    deleteIncomePaycheckBill({ commit, state }, data) {
      commit('removeIncomePaycheckBill', data);
    },
  },
  mutations: {
    setIncomesLoadStatus(state, status) {
      state.incomesLoadStatus = status;
    },
    setIncomes(state, incomes) {
      state.incomes = incomes;
    },
    setIncomeLoadStatus(state, status) {
      state.incomeLoadStatus = status;
    },
    setIncome(state, income) {
      state.income = income;
    },
    setAddIncomeStatus(state, status) {
      state.addIncomeStatus = status;
    },
    setEditIncomeStatus(state, status) {
      state.editIncomeStatus = status;
    },
    setDeleteIncomeStatus(state, status) {
      state.deleteIncomeStatus = status;
    },
    insertIncome(state, income) {
      state.incomes.push(income);
    },
    updateIncome(state, income) {
      for(let i in state.incomes) {
        if(state.incomes[i].id == income) {
          Vue.set(state.incomes, i, income);
          return;
        }
      }
    },
    removeIncome(state, income) {
      for(let i in state.incomes) {
        if(state.incomes[i].id == income.id) {
          state.incomes.splice(i, 1);
          return;
        }
      }
    },
    insertIncomePaycheck(state, paycheck) {
      for(let i in state.incomes) {
        if(state.incomes[i].id == paycheck.income_id) {
          for(let j in state.incomes[i].paychecks) {
            if(state.incomes[i].paychecks[j].id == paycheck.id) {
              state.incomes[i].paychecks.push(paycheck);
              return;
            }
          }
        }
      }
    },
    updateIncomePaycheck(state, paycheck) {
      for(let i in state.incomes) {
        if(state.incomes[i].id == paycheck.income_id) {
          for(let j in state.incomes[i].paychecks) {
            if(state.incomes[i].paychecks[j].id == paycheck.id) {
              Vue.set(state.incomes[i].paychecks, j, paycheck);
              return;
            }
          }
        }
      }
    },
    removeIncomePaycheck(state, paycheck) {
      for(let i in state.incomes) {
        if(state.incomes[i].id == paycheck.income_id) {
          for(let j in state.incomes[i].paychecks) {
            if(state.incomes[i].paychecks[j].id == paycheck.id) {
              state.incomes[i].paychecks.splice(j, 1);
              return;
            }
          }
        }
      }
    },
    insertIncomePaycheckBill(state, data) {
      let billClone = cloneDeep(data.bill);
      for(let i in state.incomes) {
        if(state.incomes[i].id == data.paycheck.income_id) {
          for(let j in state.incomes[i].paychecks) {
            if(state.incomes[i].paychecks[j].id == data.paycheck.id) {
              billClone['pivot_amount'] = data.bill_paycheck.amount;
              billClone['pivot_amount_project'] = data.bill_paycheck.amount_project;
              billClone['pivot_due_on'] = data.bill_paycheck.due_on;
              billClone['pivot_paid_on'] = data.bill_paycheck.paid_on;
              state.incomes[i].paychecks[j].bills.push(billClone);
              return;
            }
          }
        }
      }
    },
    updateIncomePaycheckBill(state, data) {
      for(let i in state.incomes) {
        if(state.incomes[i].id == data.paycheck.income_id) {
          for(let j in state.incomes[i].paychecks) {
            if(state.incomes[i].paychecks[j].id == data.paycheck.id) {
              for(let k in state.incomes[i].paychecks[j].bills) {
                if(state.incomes[i].paychecks[j].bills[k].id == data.bill.id) {
                  Vue.set(state.incomes[i].paychecks[j].bills[k], 'name', data.bill.name);
                  Vue.set(state.incomes[i].paychecks[j].bills[k], 'amount', data.bill.amount);
                  Vue.set(state.incomes[i].paychecks[j].bills[k], 'day_due_on', data.bill.day_due_on);
                  Vue.set(state.incomes[i].paychecks[j].bills[k], 'start_on', data.bill.start_on);
                  Vue.set(state.incomes[i].paychecks[j].bills[k], 'end_on', data.bill.end_on);
                  return;
                }
              }
            }
          }
        }
      }
    },
    updateIncomePaycheckBillPivot(state, data) {
      for(let i in state.incomes) {
        if(state.incomes[i].id == data.paycheck.income_id) {
          for(let j in state.incomes[i].paychecks) {
            if(state.incomes[i].paychecks[j].id == data.paycheck.id) {
              for(let k in state.incomes[i].paychecks[j].bills) {
                if(state.incomes[i].paychecks[j].bills[k].id == data.bill.id) {
                  Vue.set(state.incomes[i].paychecks[j].bills[k], 'pivot_amount', data.bill_paycheck.amount);
                  Vue.set(state.incomes[i].paychecks[j].bills[k], 'pivot_amount_project', data.bill_paycheck.amount_project);
                  Vue.set(state.incomes[i].paychecks[j].bills[k], 'pivot_due_on', data.bill_paycheck.due_on);
                  Vue.set(state.incomes[i].paychecks[j].bills[k], 'pivot_paid_on', data.bill_paycheck.paid_on);
                  return;
                }
              }
            }
          }
        }
      }
    },
    removeIncomePaycheckBill(state, data) {
      for(let i in state.incomes) {
        if(state.incomes[i].id == data.paycheck.income_id) {
          for(let j in state.incomes[i].paychecks) {
            if(state.incomes[i].paychecks[j].id == data.paycheck.id) {
              for(let k in state.incomes[i].paychecks[j].bills) {
                if(state.incomes[i].paychecks[j].bills[k].id == data.bill.id) {
                  state.incomes[i].paychecks[j].bills.splice(k, 1);
                  return;
                }
              }
            }
          }
        }
      }
    },
  },
  getters: {
    getIncomesLoadStatus(state) {
      return state.incomesLoadStatus;
    },
    getIncomes(state) {
      return state.incomes;
    },
    getIncomeLoadStatus(state) {
      return state.incomeLoadStatus;
    },
    getIncome(state){
      return state.income;
    },
    getAddIncomeStatus(state) {
      return state.addIncomeStatus;
    },
    getEditIncomeStatus(state) {
      return state.editIncomeStatus;
    },
    getDeleteIncomeStatus(state) {
      return state.deleteIncomeStatus;
    }
  }
}
