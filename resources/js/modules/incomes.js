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
    editIncomeStatus: 0,
    deleteIncomeStatus: 0,
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
    addIncome({ commit }, income) {
      commit('setAddIncomeStatus', 1);
      commit('insertIncome', income);
      IncomeAPI.postIncome(income)
        .then(res => {
          commit('insertIncomeId', res.data.data);
          commit('setAddIncomeStatus', 2);
        })
        .catch(err => {
          commit('setAddIncomeStatus', 3);
        });
    },
    editIncome({ commit }, income) {
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
    deleteIncome({ commit, dispatch }, income) {
      commit('setDeleteIncomeStatus', 1);
      for(let i in income.paychecks) {
        for(let j in income.paychecks[i].bills) {
          dispatch('deleteBillPaycheck', {
            bill: income.paychecks[i].bills[j],
            paycheck: income.paychecks[i],
          });
        }
        for(let k in income.paychecks[i].contributions) {
          dispatch('deleteGoalContributionPaycheck', {
            contribution: income.paychecks[i].contributions[j],
            paycheck: income.paychecks[i],
          });
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
    addIncomePaycheck({ commit }, paycheck) {
      commit('insertIncomePaycheck', paycheck);
    },
    addIncomePaycheckId({ commit }, paycheck) {
      commit('insertIncomePaycheckId', paycheck);
    },
    editIncomePaycheck({ commit }, paycheck) {
      commit('updateIncomePaycheck', paycheck);
    },
    deleteIncomePaycheck({ commit }, paycheck) {
      commit('removeIncomePaycheck', paycheck);
    },
    addIncomePaycheckBill({ commit }, data) {
      commit('insertIncomePaycheckBill', data);
    },
    editIncomePaycheckBill({ commit }, data) {
      commit('updateIncomePaycheckBill', data);
    },
    editIncomePaycheckBillPivot({ commit }, data) {
      commit('updateIncomePaycheckBillPivot', data);
    },
    deleteIncomePaycheckBill({ commit }, data) {
      commit('removeIncomePaycheckBill', data);
    },
    addIncomePaycheckContribution({ commit }, data) {
      commit('insertIncomePaycheckContribution', data);
    },
    editIncomePaycheckContribution({ commit }, data) {
      commit('updateIncomePaycheckContribution', data);
    },
    editIncomePaycheckContributionPivot({ commit }, data) {
      commit('updateIncomePaycheckContributionPivot', data);
    },
    deleteIncomePaycheckContribution({ commit }, data) {
      commit('removeIncomePaycheckContribution', data);
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
      state.incomes.push(cloneDeep(income));
    },
    insertIncomeId(state, income) {
      for(let i in state.incomes) {
        if(!state.incomes[i].hasOwnProperty('id')) {
          Vue.set(state.incomes[i], 'id', income.id);
          return;
        }
      }
    },
    updateIncome(state, income) {
      for(let i in state.incomes) {
        if(state.incomes[i].id == income.id) {
          Vue.set(state.incomes[i], 'name', income.name);
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
          if(!state.incomes[i].hasOwnProperty('paychecks')) {
            Vue.set(state.incomes[i], 'paychecks', []);
          }
          state.incomes[i].paychecks.push(cloneDeep(paycheck));
          return;
        }
      }
    },
    insertIncomePaycheckId(state, paycheck) {
      for(let i in state.incomes) {
        if(state.incomes[i].id == paycheck.income_id) {
          if(!state.incomes[i].hasOwnProperty('paychecks')) {
            Vue.set(state.incomes[i], 'paychecks', []);
          }
          for(let j in state.incomes[i].paychecks) {
            if(!state.incomes[i].paychecks[j].hasOwnProperty('id')) {
              Vue.set(state.incomes[i].paychecks[j], 'id', paycheck.id);
              return;
            }
          }
          return;
        }
      }
    },
    updateIncomePaycheck(state, paycheck) {
      for(let i in state.incomes) {
        if(state.incomes[i].id == paycheck.income_id) {
          for(let j in state.incomes[i].paychecks) {
            if(state.incomes[i].paychecks[j].id == paycheck.id) {
              Vue.set(state.incomes[i].paychecks[j], 'amount', paycheck.amount);
              Vue.set(state.incomes[i].paychecks[j], 'amount_project', paycheck.amount_project);
              Vue.set(state.incomes[i].paychecks[j], 'notify_when_paid', paycheck.notify_when_paid);
              Vue.set(state.incomes[i].paychecks[j], 'paid_on', paycheck.paid_on);
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
              if(!state.incomes[i].paychecks[j].hasOwnProperty('bills')) {
                Vue.set(state.incomes[i].paychecks[j], 'bills', []);
              }
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
    insertIncomePaycheckContribution(state, data) {
      let contributionClone = cloneDeep(data.contribution);
      for(let i in state.incomes) {
        if(state.incomes[i].id == data.paycheck.income_id) {
          for(let j in state.incomes[i].paychecks) {
            if(state.incomes[i].paychecks[j].id == data.paycheck.id) {
              contributionClone['pivot_amount'] = data.contribution_paycheck.amount;
              contributionClone['pivot_amount_project'] = data.contribution_paycheck.amount_project;
              contributionClone['pivot_due_on'] = data.contribution_paycheck.due_on;
              contributionClone['pivot_paid_on'] = data.contribution_paycheck.paid_on;
              if(!state.incomes[i].paychecks[j].hasOwnProperty('contributions')) {
                Vue.set(state.incomes[i].paychecks[j], 'contributions', []);
              }
              state.incomes[i].paychecks[j].contributions.push(contributionClone);
              return;
            }
          }
        }
      }
    },
    updateIncomePaycheckContribution(state, data) {
      for(let i in state.incomes) {
        if(state.incomes[i].id == data.paycheck.income_id) {
          for(let j in state.incomes[i].paychecks) {
            if(state.incomes[i].paychecks[j].id == data.paycheck.id) {
              for(let k in state.incomes[i].paychecks[j].contributions) {
                if(state.incomes[i].paychecks[j].contributions[k].id == data.contribution.id) {
                  Vue.set(state.incomes[i].paychecks[j].contributions[k], 'amount', data.contribution.amount);
                  Vue.set(state.incomes[i].paychecks[j].contributions[k], 'day_due_on', data.contribution.day_due_on);
                  Vue.set(state.incomes[i].paychecks[j].contributions[k], 'start_on', data.contribution.start_on);
                  Vue.set(state.incomes[i].paychecks[j].contributions[k], 'end_on', data.contribution.end_on);
                  return;
                }
              }
            }
          }
        }
      }
    },
    updateIncomePaycheckContributionPivot(state, data) {
      for(let i in state.incomes) {
        if(state.incomes[i].id == data.paycheck.income_id) {
          for(let j in state.incomes[i].paychecks) {
            if(state.incomes[i].paychecks[j].id == data.paycheck.id) {
              for(let k in state.incomes[i].paychecks[j].contributions) {
                if(state.incomes[i].paychecks[j].contributions[k].id == data.contribution.id) {
                  Vue.set(state.incomes[i].paychecks[j].contributions[k], 'pivot_amount', data.contribution_paycheck.amount);
                  Vue.set(state.incomes[i].paychecks[j].contributions[k], 'pivot_amount_project', data.contribution_paycheck.amount_project);
                  Vue.set(state.incomes[i].paychecks[j].contributions[k], 'pivot_due_on', data.contribution_paycheck.due_on);
                  Vue.set(state.incomes[i].paychecks[j].contributions[k], 'pivot_paid_on', data.contribution_paycheck.paid_on);
                  return;
                }
              }
            }
          }
        }
      }
    },
    removeIncomePaycheckContribution(state, data) {
      for(let i in state.incomes) {
        if(state.incomes[i].id == data.paycheck.income_id) {
          for(let j in state.incomes[i].paychecks) {
            if(state.incomes[i].paychecks[j].id == data.paycheck.id) {
              for(let k in state.incomes[i].paychecks[j].contributions) {
                if(state.incomes[i].paychecks[j].contributions[k].id == data.contribution.id) {
                  state.incomes[i].paychecks[j].contributions.splice(k, 1);
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
    },
  },
}
