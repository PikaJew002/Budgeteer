/*
|-------------------------------------------------------------------------------
| VUEX modules/goals.js
|-------------------------------------------------------------------------------
| The Vuex data store for the goals
*/

import GoalAPI from '../api/goal.js';
import Vue from 'vue';
import { cloneDeep } from 'lodash';

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
      commit('insertGoal', goal);
        .then(res => {
          commit('setAddGoalStatus', 2);
        })
        .catch(err => {
          commit('setAddGoalStatus', 3);
        });
    },
    editGoal({ commit, state, dispatch }, data) {
      commit('setEditGoalStatus', 1);
      GoalAPI.putGoal(data)
      commit('updateGoal', goal);
        .then(res => {
          commit('setEditGoalStatus', 2);
        })
        .catch(err => {
          commit('setEditGoalStatus', 3);
        });
    },
    deleteGoal({ commit, state, dispatch }, id) {
      commit('setDeleteGoalStatus', 1);
      GoalAPI.deleteGoal(id)
      for(let i in goal.contributions) {
        for(let j in goal.contributions[i].paychecks) {
          dispatch('deleteIncomePaycheckContribution', {
            paycheck: goal.contributions[i].paychecks[j],
            contribution: goal.contributions[i],
          });
        }
      }
      commit('removeGoal', goal);
        .then(res => {
          commit('setDeleteGoalStatus', 2);
        })
        .catch(err => {
          commit('setDeleteGoalStatus', 3);
        });
    },
    editGoalContribution({ commit, state }, data) {
      commit('updateGoalContribution', data);
    },
    addGoalContributionPaycheck({ commit, state }, data) {
      commit('insertGoalContributionPaycheck', data);
    },
    editGoalContributionPaycheck({ commit, state }, data) {
      commit('updateGoalContributionPaycheck', data);
    },
    editGoalContributionPaycheckPivot({ commit, state }, data) {
      commit('updateGoalContributionPaycheckPivot', data);
    },
    deleteGoalContributionPaycheck({ commit, state }, data) {
      commit('removeGoalContributionPaycheck', data);
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
    insertGoal(state, goal) {
      state.goals.push(goal);
    },
    updateGoal(state, goal) {
      for(let i in state.goals) {
        if(state.goals[i].id == goal.id) {
          Vue.set(state.goals, i, goal);
          return;
        }
      }
    },
    removeGoal(state, goal) {
      for(let i in state.goals) {
        if(state.goals[i].id == goal.id) {
          state.goals.splice(i, 1);
          return;
        }
      }
    },
    updateGoalContribution(state, data) {
      for(let i in state.goals) {
        if(state.goals[i].id == data.goal.id) {
          for(let j in state.goals[i].contributions) {
            if(state.goals[i].contributions[j].id == data.contribution.id) {
              Vue.set(state.goals[i].contributions, i, data.contribution);
              return;
            }
          }
        }
      }
    },
    insertGoalContributionPaycheck(state, data) {
      let paycheckClone = cloneDeep(data.paycheck);
      for(let i in state.goals) {
        if(state.goals[i].id == data.contribution.goal_id) {
          for(let j in state.goals[i].contributions) {
            if(state.goals[i].contributions[j].id == data.contribution.id) {
              paycheckClone['pivot_amount'] = data.contribution_paycheck.amount;
              paycheckClone['pivot_amount_project'] = data.contribution_paycheck.amount_project;
              paycheckClone['pivot_due_on'] = data.contribution_paycheck.due_on;
              paycheckClone['pivot_paid_on'] = data.contribution_paycheck.paid_on;
              state.goals[i].contributions[j].paychecks.push(paycheckClone);
              return;
            }
          }
        }
      }
    },
    updateGoalContributionPaycheck(state, data) {
      for(let i in state.goals) {
        if(state.goals[i].id == data.contribution.goal_id) {
          for(let j in state.goals[i].contributions) {
            if(state.goals[i].contributions[j].id == data.contribution.id) {
              for(let k in state.goals[i].contributions[j].paychecks) {
                if(state.goals[i].contributions[j].paychecks[k].id == data.paycheck.id) {
                  Vue.set(state.goals[i].contributions[j].paychecks[k], 'amount', data.paycheck.amount);
                  Vue.set(state.goals[i].contributions[j].paychecks[k], 'amount_project', data.paycheck.amount_project);
                  Vue.set(state.goals[i].contributions[j].paychecks[k], 'notify_when_paid', data.paycheck.notify_when_paid);
                  Vue.set(state.goals[i].contributions[j].paychecks[k], 'paid_on', data.paycheck.paid_on);
                  return;
                }
              }
            }
          }
        }
      }
    },
    updateGoalContributionPaycheckPivot(state, data) {
      for(let i in state.goals) {
        if(state.goals[i].id == data.contribution.goal_id) {
          for(let j in state.goals[i].contributions) {
            if(state.goals[i].contributions[j].id == data.contribution.id) {
              for(let k in state.goals[i].contributions[j].paychecks) {
                if(state.goals[i].contributions[j].paychecks[k].id == data.paycheck.id) {
                  Vue.set(state.goals[i].contributions[j].paychecks[k], 'pivot_amount', data.contribution_paycheck.amount);
                  Vue.set(state.goals[i].contributions[j].paychecks[k], 'pivot_amount_project', data.contribution_paycheck.amount_project);
                  Vue.set(state.goals[i].contributions[j].paychecks[k], 'pivot_due_on', data.contribution_paycheck.due_on);
                  Vue.set(state.goals[i].contributions[j].paychecks[k], 'pivot_paid_on', data.contribution_paycheck.paid_on);
                  return;
                }
              }
            }
          }
        }
      }
    },
    removeGoalContributionPaycheck(state, data) {
      for(let i in state.goals) {
        if(state.goals[i].id == data.contribution.goal_id) {
          for(let j in state.goals[i].contributions) {
            if(state.goals[i].contributions[j].id == data.contribution.id) {
              for(let k in state.goals[i].contributions[j].paychecks) {
                if(state.goals[i].contributions[j].paychecks[k].id == data.paycheck.id) {
                  state.goals[i].contributions[j].paychecks.splice(k, 1);
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
