/*
    Imports the Budgeteer API URL from the config.
*/
import { BUDGETEER_CONFIG } from '../config.js';

async function handlesValidation(url, payload, callback) {
  return await window.axios.get(BUDGETEER_CONFIG.URL + '/sanctum/csrf-cookie').then(() => {
    return window.axios.post(BUDGETEER_CONFIG.URL + url, payload)
      .then(callback);
  }).catch((err) => {
    if (err.response.status === 422) {
      return { success: false, errors: err.response.data.errors };
    }
    throw err;
  });
}

export default {
  /*
    GET   /api/user
  */
  getUser: async function() {
    return window.axios.get(BUDGETEER_CONFIG.API_URL + '/user');
  },
  /*
    POST   /login
  */
  login: async function (email, password, remember = null) {
    return handlesValidation('/login', {
      email,
      password,
      remember,
    }, () => {
      return { success: true, errors: {} };
    });
  },
  /*
    POST  /logout
  */
  logout: async function() {
    return await window.axios.post(BUDGETEER_CONFIG.URL + '/logout')
      .then(() => true).catch((err) => {
        throw err;
      });
  },
  /*
    POST  /register
  */
  register: async function(name, email, password, password_confirmation) {
    return handlesValidation('/register', {
      name,
      email,
      password,
      password_confirmation,
    }, () => {
      return { success: true, errors: {} };
    });
  },
  /*
    POST  /password/email
  */
  emailResetPasswordLink: async function(email) {
    return handlesValidation('/password/email', { email }, (res) => {
      return { success: true, message: res.data.message };
    });
  },
  /*
    POST  /password/reset
  */
  resetPassword: async function(token, email, password, password_confirmation) {
    return handlesValidation('/password/reset', {
      token,
      email,
      password,
      password_confirmation,
    }, (res) => {
      return { success: true, message: res.data.message };
    });
  },
}
