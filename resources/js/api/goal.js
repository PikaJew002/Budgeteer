/*
    Imports the Budgeteer API URL from the config.
*/
import { BUDGETEER_CONFIG } from '../config.js';

export default {
  /*
      GET     /api/goal
      @param options {object}
        can contain with [array]
      @return Promise
  */
  getGoals: function(options = {}) {
    let optionsStr = '?';
    if(options.hasOwnProperty('with') && options.with.length != 0) {
      optionsStr += (optionsStr == '?' ? 'with=' + options.with[0] : '&with=' + options.with[0]);
      for(let i in options.with) {
        if(i == 0) continue;
        optionsStr += ':' + options.with[i];
      }
    }
    return axios.get(BUDGETEER_CONFIG.API_URL + '/goal' + (optionsStr == '?' ? '' : optionsStr));
  },
  /*
    GET     /api/goal/{goal}
    @param id int
    @param options {object}
      can contain with [array]
    @return Promise
  */
  getGoal: function(id, options = {}) {
    let optionsStr = '?';
    if(options.hasOwnProperty('with') && options.with.length != 0) {
      optionsStr += (optionsStr == '?' ? 'with=' + options.with[0] : '&with=' + options.with[0]);
      for(let i in options.with) {
        if(i == 0) continue;
        optionsStr += ':' + options.with[i];
      }
    }
    return axios.get(BUDGETEER_CONFIG.API_URL + '/goal/' + id + (optionsStr == '?' ? '' : optionsStr));
  },
  /*
    POST     /api/goal
    @param goal object
    @return Promise
  */
  postGoal: function(goal) {
    return axios.post(BUDGETEER_CONFIG.API_URL + '/goal', goal);
  },
  /*
    PUT     /api/goal/{goal}
    @param data object
    @return Promise
  */
  putGoal: function(goal) {
    return axios.put(BUDGETEER_CONFIG.API_URL + '/goal', goal);
  },
  /*
    DELETE  /api/goal/{goal}
    @param id int
    @return Promise
  */
  deleteGoal: function(id) {
    return axios.delete(BUDGETEER_CONFIG.API_URL + '/goal/' + id);
  }
}
