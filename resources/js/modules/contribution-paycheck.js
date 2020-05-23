/*
|-------------------------------------------------------------------------------
| VUEX modules/contribution-paycheck.js
|-------------------------------------------------------------------------------
| The Vuex data store for the contribution-paycheck associations
*/

import ContributionPaycheckAPI from '../api/contribution-paycheck.js';
import moment from 'moment';

export const contribution_paycheck = {
  state: {
    attachContributionPaycheckStatus: 0,
    modifyContributionPaycheckStatus: 0,
    detachContributionPaycheckStatus: 0,
  },
  actions: {
    attachContributionPaycheck({ commit, dispatch }, data) {
      commit('setAttachContributionPaycheckStatus', 1);
      dispatch('addGoalContributionPaycheck', data);
      dispatch('addIncomePaycheckContribution', data);
      ContributionPaycheckAPI.postContributionPaycheck(data.contribution_paycheck)
        .then(res => {
          commit('setAttachContributionPaycheckStatus', 2);
        })
        .catch(err => {
          commit('setAttachContributionPaycheckStatus', 3);
        });
    },
    modifyContributionPaycheck({ commit, dispatch }, data) {
      commit('setModifyContributionPaycheckStatus', 1);
      dispatch('editGoalContributionPaycheckPivot', data);
      dispatch('editIncomePaycheckContributionPivot', data);
      ContributionPaycheckAPI.putContributionPaycheck(data.contribution_paycheck)
        .then(res => {
          commit('setModifyContributionPaycheckStatus', 2);
        })
        .catch(err => {
          commit('setModifyContributionPaycheckStatus', 3);
        });
    },
    detachContributionPaycheck({ commit, dispatch }, data) {
      commit('setDetachContributionPaycheckStatus', 1);
      dispatch('deleteGoalContributionPaycheck', data);
      dispatch('deleteIncomePaycheckContribution', data);
      ContributionPaycheckAPI.deleteContributionPaycheck(data.contribution_paycheck)
        .then(res => {
          commit('setDetachContributionPaycheckStatus', 2);
        })
        .catch(err => {
          commit('setDetachContributionPaycheckStatus', 3);
        });
    },
  },
  mutations: {
    setAttachContributionPaycheckStatus(state, status) {
      state.attachContributionPaycheckStatus = status;
    },
    setModifyContributionPaycheckStatus(state, status) {
      state.modifyContributionPaycheckStatus = status
    },
    setDetachContributionPaycheckStatus(state, status) {
      state.detachContributionPaycheckStatus = status;
    },
  },
  getters: {
    getAttachContributionPaycheckStatus(state) {
      return state.attachContributionPaycheckStatus;
    },
    getModifyContributionPaycheckStatus(state) {
      return state.modifyContributionPaycheckStatus;
    },
    getDetachContributionPaycheckStatus(state) {
      return state.detachContributionPaycheckStatus;
    },
  },
}
