/*
    Imports the Budgeteer API URL from the config.
*/
import { BUDGETEER_CONFIG } from '../config.js';

export default {
  /*
      GET     /api/bill
      @param options {object}
        can contain {with [array] | filter_date [array]}
      @return Promise
  */
  getBills: function(options = {}) {
    let optionsStr = '?';
    if(options.hasOwnProperty('with') && options.with.length != 0) {
      optionsStr += (optionsStr == '?' ? 'with=' + options.with[0] : '&with=' + options.with[0]);
      for(let i in options.with) {
        if(i == 0) continue;
        optionsStr += ':' + options.with[i];
      }
    }
    if(options.hasOwnProperty('filter_date') && options.filter_date.length != 0) {
      optionsStr += (optionsStr == '?' ? 'filter_date=' + options.filter_date[0] : '&filter_date=' + options.filter_date[0]);
      for(let i in options.filter_date) {
        if(i == 0) continue;
        optionsStr += ':' + options.filter_date[i];
      }
    }
    return axios.get(BUDGETEER_CONFIG.API_URL + '/bill' + (optionsStr == '?' ? '' : optionsStr));
  },
  /*
    GET     /api/bill/{id}
    @param id int
    @param options {object}
      can contain with [array]
    @return Promise
  */
  getBill: function(id, options = {}) {
    let optionsStr = '?';
    if(options.hasOwnProperty('with') && options.with.length != 0) {
      optionsStr += (optionsStr == '?' ? 'with=' + options.with[0] : '&with=' + options.with[0]);
      for(let i in options.with) {
        if(i == 0) continue;
        optionsStr += ':' + options.with[i];
      }
    }
    return axios.get(BUDGETEER_CONFIG.API_URL + '/bill/' + id + (optionsStr == '?' ? '' : optionsStr));
  },
  /*
    POST     /api/bill
    @param bill object
    @return Promise
  */
  postBill: function(bill) {
    return axios.post(BUDGETEER_CONFIG.API_URL + '/bill', bill);
  },
  /*
    PUT     /api/bill
    @param bill object
    @return Promise
  */
  putBill: function(bill) {
    return axios.put(BUDGETEER_CONFIG.API_URL + '/bill', bill);
  },
  /*
    DELETE  /api/bill
    @param id int
    @return Promise
  */
  deleteBill: function(id) {
    return axios.delete(BUDGETEER_CONFIG.API_URL + '/bill/' + id);
  }
}
