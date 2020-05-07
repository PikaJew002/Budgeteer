/*
|-------------------------------------------------------------------------------
| VUEX modules/goals.js
|-------------------------------------------------------------------------------
| The Vuex data store for the goals
*/

import GoalAPI from '../api/goal.js';

export const goals = {
  state: {
    goals: [],
    goalsLoadStatus: 0,
    goal: {},
    goalLoadStatus: 0,
    addGoalStatus: 0,
    editGoalStatus: 0,
    deleteGoalStatus: 0,
  },
  actions: {
    loadGoals({ commit }, data) {
      commit('setGoalsLoadStatus', 1);
      GoalAPI.getGoals(data)
        .then(res => {
          commit('setGoals', res.data.data);
          commit('setGoalsLoadStatus', 2);
        })
        .catch(err => {
          commit('setGoals', []);
          commit('setGoalsLoadStatus', 3);
        });
    },
    loadGoal({ commit }, data) {
      commit('setGoalLoadStatus', 1);
      GoalAPI.getGoal(data.id)
        .then(res => {
          commit('setGoal', res.data.data);
          commit('setGoalLoadStatus', 2);
        })
        .catch(err => {
          commit('setGoal', {});
          commit('setGoalLoadStatus', 3);
        });
    },
    addGoal({ commit, state, dispatch }, data) {
      commit('setAddGoalStatus', 1);
      GoalAPI.postGoal(data)
        .then(res => {
          commit('setAddGoalStatus', 2);
          dispatch('loadGoals');
        })
        .catch(err => {
          commit('setAddGoalStatus', 3);
        });
    },
    editGoal({ commit, state, dispatch }, data) {
      commit('setEditGoalStatus', 1);
      GoalAPI.putGoal(data)
        .then(res => {
          commit('setEditGoalStatus', 2);
          dispatch('loadGoals');
        })
        .catch(err => {
          commit('setEditGoalStatus', 3);
        });
    },
    deleteGoal({ commit, state, dispatch }, id) {
      commit('setDeleteGoalStatus', 1);
      GoalAPI.deleteGoal(id)
        .then(res => {
          commit('setDeleteGoalStatus', 2);
          dispatch('loadGoals');
        })
        .catch(err => {
          commit('setDeleteGoalStatus', 3);
        });
    },
  },
  mutations: {
    setGoalsLoadStatus(state, status) {
      state.goalsLoadStatus = status;
    },
    setGoals(state, goals) {
      state.goals = goals;
    },
    setGoalLoadStatus(state, status) {
      state.goalLoadStatus = status;
    },
    setGoal(state, goal) {
      state.goal = goal;
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
  },
  getters: {
    getGoalsLoadStatus(state) {
      return state.goalsLoadStatus;
    },
    getGoals(state) {
      return state.goals;
    },
    getGoalLoadStatus(state) {
      return state.goalLoadStatus;
    },
    getGoal(state){
      return state.goal;
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
