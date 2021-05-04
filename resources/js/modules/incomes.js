/*
|-------------------------------------------------------------------------------
| VUEX modules/incomes.js
|-------------------------------------------------------------------------------
| The Vuex data store for the incomes
*/

import IncomeAPI from '../api/income.js';
import { objectToArray } from '../utils/main.js';
import Vue from 'vue';
import { cloneDeep } from 'lodash';

export const incomes = {
  state: {
    incomes: {},
    incomesLoadStatus: 0,
    addIncomeStatus: 0,
    editIncomeStatus: 0,
    deleteIncomeStatus: 0,
  },
  actions: {
    loadIncomes({ commit }, options) {
      commit('setIncomesLoadStatus', 1);
      IncomeAPI.getIncomes(options)
        .then((res) => res.data.data)
        .then((incomes) => {
          incomes.forEach((income) => {
            commit('insertIncome', income);
          });
          commit('setIncomesLoadStatus', 2);
        })
        .catch((err) => {
          commit('setIncomesLoadStatus', 3);
          throw err;
        });
    },
    async addIncome({ commit }, income) {
      commit('setAddIncomeStatus', 1);
      await IncomeAPI.postIncome(income)
        .then((res) => {
          commit('insertIncome', res.data.data);
          commit('setAddIncomeStatus', 2);
          return res.data.data;
        })
        .catch((err) => {
          commit('setAddIncomeStatus', 3);
          throw err;
        });
    },
    async editIncome({ commit }, income) {
      commit('setEditIncomeStatus', 1);
      await IncomeAPI.putIncome(income)
        .then((res) => {
          commit('insertIncome', res.data.data);
          commit('setEditIncomeStatus', 2);
          return res.data.data;
        })
        .catch((err) => {
          commit('setEditIncomeStatus', 3);
          throw err;
        });
    },
    async deleteIncome({ commit, dispatch, getters }, income) {
      commit('setDeleteIncomeStatus', 1);
      await Promise.all(getters.getPaychecks.filter((paycheck) => {
        return paycheck.income_id === income.id;
      }).map(async (paycheck) => {
        return await dispatch('deletePaycheck', paycheck);
      }));
      await IncomeAPI.deleteIncome(income.id)
        .then((res) => {
          commit('removeIncome', res.data.data);
          commit('setDeleteIncomeStatus', 2);
          return res.data.data;
        })
        .catch((err) => {
          commit('setDeleteIncomeStatus', 3);
          throw err;
        });
    },
  },
  mutations: {
    setIncomesLoadStatus(state, status) {
      state.incomesLoadStatus = status;
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
      Vue.set(state.incomes, income.id, cloneDeep(income));
    },
    updateIncome(state, income) {
      Vue.set(state.incomes[income.id], 'name', income.name);
      Vue.set(state.incomes[income.id], 'created_at', income.created_at);
      Vue.set(state.incomes[income.id], 'updated_at', income.updated_at);
    },
    removeIncome(state, income) {
      Vue.delete(state.incomes, income.id);
    },
  },
  getters: {
    getIncome: (state) => (id) => {
      return state.incomes[id];
    },
    getIncomes(state) {
      return objectToArray(state.incomes);
    },
    getIncomesLoadStatus(state) {
      return state.incomesLoadStatus;
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
