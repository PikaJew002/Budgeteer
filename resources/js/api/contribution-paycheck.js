/*
    Imports the Budgeteer API URL from the config.
*/
import { BUDGETEER_CONFIG } from '../config.js';

export default {
  /*
    POST    /api/contributionpaycheck
    @param contribution_paycheck object
    @return Promise
  */
  postContributionPaycheck: function(contribution_paycheck) {
    return axios.post(BUDGETEER_CONFIG.API_URL + '/contributionpaycheck', contribution_paycheck);
  },
  /*
    PUT     /api/contributionpaycheck
    @param contribution_paycheck object
    @return Promise
  */
  putContributionPaycheck: function(contribution_paycheck) {
    return axios.put(BUDGETEER_CONFIG.API_URL + '/contributionpaycheck', contribution_paycheck);
  },
  /*
    DELETE  /api/contributionpaycheck/{contributionId}/{paycheckId}
    @param contribution_id int
    @param paycheck_id int
    @return Promise
  */
  deleteContributionPaycheck: function(contribution_paycheck) {
    return axios.delete(BUDGETEER_CONFIG.API_URL + '/contributionpaycheck/' + contribution_paycheck.contribution_id + '/' + contribution_paycheck.paycheck_id);
  },
}
