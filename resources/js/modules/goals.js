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
    loadGoals({ commit }, options) {
      commit('setGoalsLoadStatus', 1);
      GoalAPI.getGoals(options)
        .then(res => {
          commit('setGoals', res.data.data);
          commit('setGoalsLoadStatus', 2);
        })
        .catch(err => {
          commit('setGoals', []);
          commit('setGoalsLoadStatus', 3);
        });
    },
    loadGoal({ commit }, goal) {
      commit('setGoalLoadStatus', 1);
      GoalAPI.getGoal(goal.id)
        .then(res => {
          commit('setGoal', res.data.data);
          commit('setGoalLoadStatus', 2);
        })
        .catch(err => {
          commit('setGoal', {});
          commit('setGoalLoadStatus', 3);
        });
    },
    addGoal({ commit }, goal) {
      commit('setAddGoalStatus', 1);
      commit('insertGoal', goal);
      GoalAPI.postGoal(goal)
        .then(res => {
          commit('insertGoalId', res.data.data);
          for(let i in res.data.data.contributions) {
            commit('insertGoalContribution', res.data.data.contributions[i]);
          }
          commit('setAddGoalStatus', 2);
        })
        .catch(err => {
          commit('setAddGoalStatus', 3);
        });
    },
    editGoal({ commit, state, dispatch }, data) {
      commit('setEditGoalStatus', 1);
      for(let i in data.contributionsDeleted) {
        if(data.contributionsDeleted[i].hasOwnProperty('id')) {
          if(data.contributionsDeleted[i].hasOwnProperty('paychecks')) {
            for(let j in data.contributionsDeleted[i].paychecks) {
              dispatch('deleteIncomePaycheckContribution', {
                paycheck: data.contributionsDeleted[i].paychecks[j],
                contribution: data.contributionsDeleted[i],
              });
            }
          }
          commit('removeGoalContribution', data.contributionsDeleted[i]);
        }
      }
      for(let k in data.paychecksDeleted) {
        for(let l in data.goal.contributions) {
          if(data.goal.contributions[l].hasOwnProperty('paychecks')) {
            for(let m in data.goal.contributions[l].paychecks) {
              if(data.goal.contributions[l].paychecks[m].id == data.paychecksDeleted[k].id) {
                dispatch('deleteIncomePaycheckContribution', {
                  paycheck: data.paychecksDeleted[k],
                  contribution: data.goal.contributions[l],
                });
                commit('removeGoalContributionPaycheck', {
                  contribution: data.goal.contributions[l],
                  paycheck: data.paychecksDeleted[k],
                });
              }
            }
          }
        }
      }
      commit('updateGoal', data.goal);
      GoalAPI.putGoal(data.goal)
        .then(res => {
          // update or insert contributions found in the resonse goal
          for(let i in res.data.data.contributions) {
            for(let j in state.goals) {
              if(state.goals[j].id == res.data.data.id) {
                var found = false;
                for(let k in state.goals[j].contributions) {
                  if(res.data.data.contributions[i].id == state.goals[j].contributions[k].id) {
                    found = true;
                    for(let l in res.data.data.contributions[i].paychecks) {
                      dispatch('editIncomePaycheckContribution', {
                        paycheck: res.data.data.contributions[i].paychecks[l],
                        contribution: res.data.data.contributions[i],
                      });
                    }
                    commit('updateGoalContribution', res.data.data.contributions[i]);
                    break;
                  }
                }
                if(!found) {
                  commit('insertGoalContribution', res.data.data.contributions[i]);
                }
                break;
              }
            }
          }
          commit('setEditGoalStatus', 2);
        })
        .catch(err => {
          commit('setEditGoalStatus', 3);
        });
    },
    deleteGoal({ commit, dispatch }, goal) {
      commit('setDeleteGoalStatus', 1);
      for(let i in goal.contributions) {
        for(let j in goal.contributions[i].paychecks) {
          dispatch('deleteIncomePaycheckContribution', {
            paycheck: goal.contributions[i].paychecks[j],
            contribution: goal.contributions[i],
          });
        }
      }
      commit('removeGoal', goal);
      GoalAPI.deleteGoal(goal.id)
        .then(res => {
          commit('setDeleteGoalStatus', 2);
        })
        .catch(err => {
          commit('setDeleteGoalStatus', 3);
        });
    },
    addGoalContribution({ commit }, contribution) {
      commit('insertGoalContribution', contribution);
    },
    editGoalContribution({ commit }, contribution) {
      commit('updateGoalContribution', contribution);
    },
    addGoalContributionPaycheck({ commit }, data) {
      commit('insertGoalContributionPaycheck', data);
    },
    editGoalContributionPaycheck({ commit }, data) {
      commit('updateGoalContributionPaycheck', data);
    },
    editGoalContributionPaycheckPivot({ commit }, data) {
      commit('updateGoalContributionPaycheckPivot', data);
    },
    deleteGoalContributionPaycheck({ commit }, data) {
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
      let newGoal = cloneDeep(goal);
      newGoal.contributions = [];
      state.goals.push(newGoal);
    },
    insertGoalId(state, goal) {
      for(let i in state.goals) {
        if(!state.goals[i].hasOwnProperty('id')) {
          Vue.set(state.goals[i], 'id', goal.id);
          return;
        }
      }
    },
    updateGoal(state, goal) {
      for(let i in state.goals) {
        if(state.goals[i].id == goal.id) {
          Vue.set(state.goals[i], 'name', goal.name);
          Vue.set(state.goals[i], 'amount', goal.amount);
          Vue.set(state.goals[i], 'initial_amount ', goal.initial_amount);
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
    insertGoalContribution(state, contribution) {
      for(let i in state.goals) {
        if(state.goals[i].id == contribution.goal_id) {
          if(!state.goals[i].hasOwnProperty('contributions')) {
            Vue.set(state.goals[i], 'contributions', []);
          }
          state.goals[i].contributions.push(cloneDeep(contribution));
          return;
        }
      }
    },
    updateGoalContribution(state, contribution) {
      for(let i in state.goals) {
        if(state.goals[i].id == contribution.goal_id) {
          for(let j in state.goals[i].contributions) {
            if(state.goals[i].contributions[j].id == contribution.id) {
              Vue.set(state.goals[i].contributions[j], 'amount', contribution.amount);
              Vue.set(state.goals[i].contributions[j], 'day_due_on', contribution.day_due_on);
              Vue.set(state.goals[i].contributions[j], 'start_on', contribution.start_on);
              Vue.set(state.goals[i].contributions[j], 'end_on', contribution.end_on);
              return;
            }
          }
        }
      }
    },
    removeGoalContribution(state, contribution) {
      for(let i in state.goals) {
        if(state.goals[i].id == contribution.goal_id) {
          for(let j in state.goals[i].contributions) {
            if(state.goals[i].contributions[j].id == contribution.id) {
              state.goals[i].contributions.splice(j, 1);
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
              paycheckClone['contribution_amount'] = data.contribution_paycheck.amount;
              paycheckClone['contribution_amount_project'] = data.contribution_paycheck.amount_project;
              paycheckClone['contribution_due_on'] = data.contribution_paycheck.due_on;
              paycheckClone['contribution_paid_on'] = data.contribution_paycheck.paid_on;
              if(!state.goals[i].contributions[j].hasOwnProperty('paychecks')) {
                Vue.set(state.goals[i].contributions[j], 'paychecks', []);
              }
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
                  Vue.set(state.goals[i].contributions[j].paychecks[k], 'contribution_amount', data.contribution_paycheck.amount);
                  Vue.set(state.goals[i].contributions[j].paychecks[k], 'contribution_amount_project', data.contribution_paycheck.amount_project);
                  Vue.set(state.goals[i].contributions[j].paychecks[k], 'contribution_due_on', data.contribution_paycheck.due_on);
                  Vue.set(state.goals[i].contributions[j].paychecks[k], 'contribution_paid_on', data.contribution_paycheck.paid_on);
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
