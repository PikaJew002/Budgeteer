/*
    Imports the Budgeteer API URL from the config.
*/
import { BUDGETEER_CONFIG } from '../config.js';

export default {
  /*
    POST    /api/billpaycheck
    @param bill_paycheck object
    @return Promise
  */
  postBillPaycheck: function(bill_paycheck) {
    return axios.post(BUDGETEER_CONFIG.API_URL + '/billpaycheck', bill_paycheck);
  },
  /*
    PUT     /api/billpaycheck
    @param bill_paycheck object
    @return Promise
  */
  putBillPaycheck: function(bill_paycheck) {
    return axios.put(BUDGETEER_CONFIG.API_URL + '/billpaycheck', bill_paycheck);
  },
  /*
    DELETE  /api/billpaycheck/{billId}/{paycheckId}
    @param bill_id int
    @param paycheck_id int
    @return Promise
  */
  deleteBillPaycheck: function(bill_paycheck) {
    return axios.delete(BUDGETEER_CONFIG.API_URL + '/billpaycheck/' + bill_paycheck.bill_id + '/' + bill_paycheck.paycheck_id);
  }
}
