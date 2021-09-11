/*
|-------------------------------------------------------------------------------
| VUEX modules/contribution-paycheck.js
|-------------------------------------------------------------------------------
| The Vuex data store for the contribution-paycheck associations
*/

import ContributionPaycheckAPI from '../api/contribution-paycheck.js';
import { objectToArray } from '../utils/main.js';
import Vue from 'vue';
import { cloneDeep } from 'lodash';
import moment from 'moment';

export const contribution_paycheck = {
  state: {
    contribution_paychecks: {},
    attachContributionPaycheckStatus: 0,
    modifyContributionPaycheckStatus: 0,
    detachContributionPaycheckStatus: 0,
  },
  actions: {
    loadContributionPaychecks({ commit }, contribution_paychecks) {
      contribution_paychecks.forEach(contribution_paycheck => {
        commit('insertContributionPaycheck', contribution_paycheck);
      });
    },
    async attachContributionPaycheck({ commit }, contribution_paycheck) {
      commit('setAttachContributionPaycheckStatus', 1);
      await ContributionPaycheckAPI.postContributionPaycheck(contribution_paycheck)
        .then((res) => {
          commit('insertContributionPaycheck', res.data.data);
          commit('setAttachContributionPaycheckStatus', 2);
          return res.data.data;
        })
        .catch((err) => {
          commit('setAttachContributionPaycheckStatus', 3);
          throw err;
        });
    },
    async modifyContributionPaycheck({ commit }, contribution_paycheck) {
      commit('setModifyContributionPaycheckStatus', 1);
      await ContributionPaycheckAPI.putContributionPaycheck(contribution_paycheck)
        .then((res) => {
          commit('updateContributionPaycheck', res.data.data);
          commit('setModifyContributionPaycheckStatus', 2);
          return res.data.data;
        })
        .catch((err) => {
          commit('setModifyContributionPaycheckStatus', 3);
          throw err;
        });
    },
    async detachContributionPaycheck({ commit }, contribution_paycheck) {
      commit('setDetachContributionPaycheckStatus', 1);
      await ContributionPaycheckAPI.deleteContributionPaycheck(contribution_paycheck)
        .then((res) => {
          commit('removeContributionPaycheck', res.data.data);
          commit('setDetachContributionPaycheckStatus', 2);
          return res.data.data;
        })
        .catch((err) => {
          commit('setDetachContributionPaycheckStatus', 3);
          throw err;
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
    insertContributionPaycheck(state, contribution_paycheck) {
      Vue.set(state.contribution_paychecks, `${contribution_paycheck.contribution_id}_${contribution_paycheck.paycheck_id}`, cloneDeep(contribution_paycheck));
    },
    updateContributionPaycheck(state, contribution_paycheck) {
      Vue.set(state.contribution_paychecks[`${contribution_paycheck.contribution_id}_${contribution_paycheck.paycheck_id}`], 'amount', contribution_paycheck.amount);
      Vue.set(state.contribution_paychecks[`${contribution_paycheck.contribution_id}_${contribution_paycheck.paycheck_id}`], 'amount_project', contribution_paycheck.amount_project);
      Vue.set(state.contribution_paychecks[`${contribution_paycheck.contribution_id}_${contribution_paycheck.paycheck_id}`], 'due_on', contribution_paycheck.due_on);
      Vue.set(state.contribution_paychecks[`${contribution_paycheck.contribution_id}_${contribution_paycheck.paycheck_id}`], 'paid_on', contribution_paycheck.paid_on);
      Vue.set(state.contribution_paychecks[`${contribution_paycheck.contribution_id}_${contribution_paycheck.paycheck_id}`], 'created_at', contribution_paycheck.created_at);
      Vue.set(state.contribution_paychecks[`${contribution_paycheck.contribution_id}_${contribution_paycheck.paycheck_id}`], 'updated_at', contribution_paycheck.updated_at);
    },
    removeContributionPaycheck(state, contribution_paycheck) {
      Vue.delete(state.contribution_paychecks, `${contribution_paycheck.contribution_id}_${contribution_paycheck.paycheck_id}`);
    },
  },
  getters: {
    getContributionPaycheck: (state) => (contribution_id, paycheck_id) => {
      return state.contribution_paychecks[`${contribution_id}_${paycheck_id}`];
    },
    getContributionPaychecks(state) {
      return objectToArray(state.contribution_paychecks);
    },
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
