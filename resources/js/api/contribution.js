/*
    Imports the Budgeteer API URL from the config.
*/
import { BUDGETEER_CONFIG } from '../config.js';

export default {
  /*
      GET     /api/contribution
      @param options {object}
        can contain with [array]
      @return Promise
  */
  getContributions: function(options = {}) {
    let optionsStr = '?';
    if(options.hasOwnProperty('with') && options.with.length != 0) {
      optionsStr += (optionsStr == '?' ? 'with=' + options.with[0] : '&with=' + options.with[0]);
      for(let i in options.with) {
        if(i == 0) continue;
        optionsStr += ':' + options.with[i];
      }
    }
    return axios.get(BUDGETEER_CONFIG.API_URL + '/contribution' + (optionsStr == '?' ? '' : optionsStr));
  },
  /*
    GET     /api/contribution/{contribution}
    @param id int
    @param options {object}
      can contain with [array]
    @return Promise
  */
  getContribution: function(id, options = {}) {
    let optionsStr = '?';
    if(options.hasOwnProperty('with') && options.with.length != 0) {
      optionsStr += (optionsStr == '?' ? 'with=' + options.with[0] : '&with=' + options.with[0]);
      for(let i in options.with) {
        if(i == 0) continue;
        optionsStr += ':' + options.with[i];
      }
    }
    return axios.get(BUDGETEER_CONFIG.API_URL + '/contribution/' + id + (optionsStr == '?' ? '' : optionsStr));
  },
  /*
    POST     /api/contribution
    @param contribution object
    @return Promise
  */
  postContribution: function(contribution) {
    return axios.post(BUDGETEER_CONFIG.API_URL + '/contribution', contribution);
  },
  /*
    PUT     /api/contribution/{contribution}
    @param data object
    @return Promise
  */
  putContribution: function(contribution) {
    return axios.put(BUDGETEER_CONFIG.API_URL + '/contribution', contribution);
  },
  /*
    DELETE  /api/contribution/{contribution}
    @param id int
    @return Promise
  */
  deleteContribution: function(id) {
    return axios.delete(BUDGETEER_CONFIG.API_URL + '/contribution/' + id);
  }
}
