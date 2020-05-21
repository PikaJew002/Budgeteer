/*
    Imports the Budgeteer API URL from the config.
*/
import { BUDGETEER_CONFIG } from '../config.js';

export default {
  /*
      GET /api/paycheck
      @param options {object}
        can contain with [array]
      @return Promise
  */
  getPaychecks: function(options = {}) {
    let optionsStr = '?';
    if(options.hasOwnProperty('with') && options.with.length != 0) {
      optionsStr += (optionsStr == '?' ? 'with=' + options.with[0] : '&with=' + options.with[0]);
      for(let i in options.with) {
        if(i == 0) continue;
        optionsStr += ':' + options.with[i];
      }
    }
    return axios.get(BUDGETEER_CONFIG.API_URL + '/paycheck' + (optionsStr == '?' ? '' : optionsStr));
  },
  /*
    GET   /api/paycheck/{id}
    @param id int
    @param options {object}
      can contain with [array]
    @return Promise
  */
  getPaycheck: function(id, options = {}) {
    let optionsStr = '?';
    if(options.hasOwnProperty('with') && options.with.length != 0) {
      optionsStr += (optionsStr == '?' ? 'with=' + options.with[0] : '&with=' + options.with[0]);
      for(let i in options.with) {
        if(i == 0) continue;
        optionsStr += ':' + options.with[i];
      }
    }
    return axios.get(BUDGETEER_CONFIG.API_URL + '/paycheck/' + id + (optionsStr == '?' ? '' : optionsStr));
  },
  /*
    POST   /api/paycheck
    @param paycheck object
    @return Promise
  */
  postPaycheck: function(paycheck) {
    return axios.post(BUDGETEER_CONFIG.API_URL + '/paycheck', paycheck);
  },
  /*
    PUT     /api/paycheck
    @param data object
    @return Promise
  */
  putPaycheck: function(paycheck) {
    return axios.put(BUDGETEER_CONFIG.API_URL + '/paycheck', paycheck);
  },
  /*
    DELETE   /api/paycheck/{id}
    @param id int
    @return Promise
  */
  deletePaycheck: function(id) {
    return axios.delete(BUDGETEER_CONFIG.API_URL + '/paycheck/' + id);
  },
}
