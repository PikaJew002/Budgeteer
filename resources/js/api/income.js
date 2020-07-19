/*
    Imports the Budgeteer API URL from the config.
*/
import { BUDGETEER_CONFIG } from '../config.js';

export default {
  /*
      GET     /api/income
      @param options {object}
        can contain with [array]
      @return Promise
  */
  getIncomes: function(options = {}) {
    let optionsStr = '?';
    if(options.hasOwnProperty('with') && options.with.length != 0) {
      optionsStr += (optionsStr == '?' ? 'with=' + options.with[0] : '&with=' + options.with[0]);
      for(let i in options.with) {
        if(i == 0) continue;
        optionsStr += ':' + options.with[i];
      }
    }
    return axios.get(BUDGETEER_CONFIG.API_URL + '/income' + (optionsStr == '?' ? '' : optionsStr));
  },
  /*
    GET     /api/income/{id}
    @param id int
    @param options {object}
      can contain with [array]
    @return Promise
  */
  getIncome: function(id, options = {}) {
    let optionsStr = '?';
    if(options.hasOwnProperty('with') && options.with.length != 0) {
      optionsStr += (optionsStr == '?' ? 'with=' + options.with[0] : '&with=' + options.with[0]);
      for(let i in options.with) {
        if(i == 0) continue;
        optionsStr += ':' + options.with[i];
      }
    }
    return axios.get(BUDGETEER_CONFIG.API_URL + '/income/' + id + (optionsStr == '?' ? '' : optionsStr));
  },
  /*
    POST     /api/income
    @param income object
    @return Promise
  */
  postIncome: function(income) {
    return axios.post(BUDGETEER_CONFIG.API_URL + '/income', income);
  },
  /*
    PUT     /api/income
    @param income object
    @return Promise
  */
  putIncome: function(income) {
    return axios.put(BUDGETEER_CONFIG.API_URL + '/income', income);
  },
  /*
    DELETE  /api/income
    @param id int
    @return Promise
  */
  deleteIncome: function(id) {
    return axios.delete(BUDGETEER_CONFIG.API_URL + '/income/' + id);
  }
}
