/*
    Imports the Budgeteer API URL from the config.
*/
import { BUDGETEER_CONFIG } from '../config.js';

export default {
  /*
    GET   /api/user
  */
  getUser: function() {
    return axios.get(BUDGETEER_CONFIG.API_URL + '/user');
  },
  /*
    POST   /login
  */
  login: async function(email, password) {
    return await axios.post(BUDGETEER_CONFIG.URL + '/login', {
      email: email,
      password: password
    }).then((res) => {
      return res.data;
    }).catch((err) => {
      throw err;
    });
  },
  /*
    POST  /Logout
  */
  logout: async function() {
    return await axios.post(BUDGETEER_CONFIG.URL + '/logout', {
    }).then((res) => {
      return res.data;
    }).catch((err) => {
      throw err;
    });
  }
}
