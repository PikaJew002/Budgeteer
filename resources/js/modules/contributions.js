/*
|-------------------------------------------------------------------------------
| VUEX modules/contributions.js
|-------------------------------------------------------------------------------
| The Vuex data store for the contributions
*/

import ContributionAPI from '../api/contribution.js';
import { objectToArray } from '../utils/main.js';
import Vue from 'vue';
import { cloneDeep } from 'lodash';

export const contributions = {
  state: {
    contributions: {},
    contributionsLoadStatus: 0,
    addContributionStatus: 0,
    editContributionStatus: 0,
    deleteContributionStatus: 0,
  },
  actions: {
    loadContributions({ commit, dispatch }, data) {
      commit('setContributionsLoadStatus', 1);
      ContributionAPI.getContributions(data)
        .then(res => {
          res.data.data.forEach(contribution => {
            commit('insertContribution', contribution);
            dispatch('loadContributionPaychecks', contribution.paychecks.map(paycheck => paycheck.contribution));
          });
          commit('setContributionsLoadStatus', 2);
        })
        .catch(err => {
          console.log(err);
          commit('setContributionsLoadStatus', 3);
        });
    },
    addContribution({ commit }, contribution) {
      commit('setAddContributionStatus', 1);
      ContributionAPI.postContribution(contribution)
        .then(res => {
          commit('insertContribution', res.data.data);
          commit('setAddContributionStatus', 2);
        })
        .catch(err => {
          commit('setAddContributionStatus', 3);
        });
    },
    async editContribution({ commit }, contribution) {
      commit('setEditContributionStatus', 1);
      await ContributionAPI.putContribution(contribution)
        .then(res => {
          commit('updateContribution', res.data.data);
          commit('setEditContributionStatus', 2);
        })
        .catch(err => {
          commit('setEditContributionStatus', 3);
        });
    },
    async deleteContribution({ commit, dispatch, getters }, contribution) {
      commit('setDeleteContributionStatus', 1);
      // delete ContributionPaychecks before deleting Contribution
      await Promise.all(getters.getContributionPaychecks.filter((contribution_paycheck) => {
        return contribution_paycheck.contribution_id === contribution.id;
      }).map(async (contribution_paycheck) => {
        return await dispatch('detachContributionPaycheck', contribution_paycheck);
      }));
      await ContributionAPI.deleteContribution(contribution.id)
        .then(res => {
          commit('removeContribution', res.data.data);
          commit('setDeleteContributionStatus', 2);
        })
        .catch(err => {
          commit('setDeleteContributionStatus', 3);
        });
    },
  },
  mutations: {
    setContributionsLoadStatus(state, status) {
      state.contributionsLoadStatus = status;
    },
    setAddContributionStatus(state, status) {
      state.addContributionStatus = status;
    },
    setEditContributionStatus(state, status) {
      state.editContributionStatus = status;
    },
    setDeleteContributionStatus(state, status) {
      state.deleteContributionStatus = status;
    },
    insertContribution(state, contribution) {
      Vue.set(state.contributions, contribution.id, cloneDeep(contribution));
    },
    updateContribution(state, contribution) {
      Vue.set(state.contributions[contribution.id], 'amount', contribution.amount);
      Vue.set(state.contributions[contribution.id], 'day_due_on', contribution.day_due_on);
      Vue.set(state.contributions[contribution.id], 'start_on', contribution.start_on);
      Vue.set(state.contributions[contribution.id], 'end_on', contribution.end_on);
      Vue.set(state.contributions[contribution.id], 'created_at', contribution.created_at);
      Vue.set(state.contributions[contribution.id], 'updated_at', contribution.updated_at);
    },
    removeContribution(state, contribution) {
      Vue.delete(state.contributions, contribution.id);
    },
  },
  getters: {
    /**
     * @param id int
     * @return object
     */
    getContribution: (state) => (id) => {
      return state.contributions[id];
    },
    /**
     * @return array
     */
    getContributions(state) {
        return objectToArray(state.contributions);
    },
    getContributionsLoadStatus(state) {
      return state.contributionsLoadStatus;
    },
    getAddContributionStatus(state) {
      return state.addContributionStatus;
    },
    getEditContributionStatus(state) {
      return state.editContributionStatus;
    },
    getDeleteContributionStatus(state) {
      return state.deleteContributionStatus;
    },
  },
};
