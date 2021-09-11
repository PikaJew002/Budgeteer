/*
|-------------------------------------------------------------------------------
| VUEX modules/goals.js
|-------------------------------------------------------------------------------
| The Vuex data store for the goals
*/

import GoalAPI from '../api/goal.js';
import { objectToArray } from '../utils/main.js';
import Vue from 'vue';
import { cloneDeep } from 'lodash';

export const goals = {
  state: {
    goals: {},
    goalsLoadStatus: 0,
    addGoalStatus: 0,
    editGoalStatus: 0,
    deleteGoalStatus: 0,
  },
  actions: {
    loadGoals({ commit }, options) {
      commit('setGoalsLoadStatus', 1);
      GoalAPI.getGoals(options)
        .then((res) => res.data.data)
        .then((goals) => {
          goals.forEach((goal) => {
            commit('insertGoal', goal);
          });
          commit('setGoalsLoadStatus', 2);
        })
        .catch((err) => {
          commit('setGoalsLoadStatus', 3);
          throw err;
        });
    },
    async addGoal({ commit }, data) {
      commit('setAddGoalStatus', 1);
      return await GoalAPI.postGoal(data.goal)
        .then((res) => {
          commit('insertGoal', res.data.data);
          commit('setAddGoalStatus', 2);
          return res.data.data;
        })
        .catch((err) => {
          commit('setAddGoalStatus', 3);
          throw err;
        });
    },
    async editGoal({ commit }, goal) {
      commit('setEditGoalStatus', 1);
      await GoalAPI.putGoal(goal)
        .then((res) => {
          commit('updateGoal', res.data.data);
          commit('setEditGoalStatus', 2);
          return res.data.data;
        })
        .catch((err) => {
          commit('setEditGoalStatus', 3);
          throw err;
        });
    },
    async deleteGoal({ commit, dispatch, getters }, goal) {
      commit('setDeleteGoalStatus', 1);
      await Promise.all(getters.getContributions.filter((contribution) => {
        return contribution.goal_id === goal.id;
      }).map(async (contribution) => {
        return await dispatch('deleteContribution', contribution);
      }));
      await GoalAPI.deleteGoal(goal.id)
        .then((res) => {
          commit('removeGoal', goal);
          commit('setDeleteGoalStatus', 2);
          return res.data.data;
        })
        .catch((err) => {
          commit('setDeleteGoalStatus', 3);
          throw err;
        });
    },
  },
  mutations: {
    setGoalsLoadStatus(state, status) {
      state.goalsLoadStatus = status;
    },
    setAddGoalStatus(state, status) {
      state.addGoalStatus = status;
    },
    setEditGoalStatus(state, status) {
      state.editGoalStatus = status;
    },
    setDeleteGoalStatus(state, status) {
      state.deleteGoalStatus = status;
    },
    insertGoal(state, goal) {
      Vue.set(state.goals, goal.id, cloneDeep(goal));
    },
    updateGoal(state, goal) {
      Vue.set(state.goals[goal.id], 'name', goal.name);
      Vue.set(state.goals[goal.id], 'amount', goal.amount);
      Vue.set(state.goals[goal.id], 'initial_amount ', goal.initial_amount);
      Vue.set(state.goals[goal.id], 'created_at', goal.created_at);
      Vue.set(state.goals[goal.id], 'updated_at', goal.updated_at);
    },
    removeGoal(state, goal) {
      Vue.delete(state.goals, goal.id);
    },
  },
  getters: {
    getGoal: (state) => (id) => {
      return state.goals[id];
    },
    getGoals(state) {
      return objectToArray(state.goals);
    },
    getGoalsLoadStatus(state) {
      return state.goalsLoadStatus;
    },
    getAddGoalStatus(state) {
      return state.addGoalStatus;
    },
    getEditGoalStatus(state) {
      return state.editGoalStatus;
    },
    getDeleteGoalStatus(state) {
      return state.deleteGoalStatus;
    },
  },
}
