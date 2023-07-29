/*
|-------------------------------------------------------------------------------
| routes.js
|-------------------------------------------------------------------------------
| Contains all of the routes for the application
*/

/*
    Imports Vue and VueRouter to extend with the routes.
*/
import Vue from 'vue';
import VueRouter from 'vue-router';
import store from './store.js';

/*
    Extends Vue to use Vue Router
*/
Vue.use(VueRouter);

/*
    This will cehck to see if the user is authenticated or not.
*/
function requireAuth(to, from, next) {
  /*
  Determines where we should send the user.
  */
  function proceed() {
    /*
      If the user has been loaded determine where we should
      send the user.
    */
    if(store.getters.getUserLoadStatus() == 2) {
      /*
        If the user is not empty, that means there's a user
        authenticated we allow them to continue. Otherwise, we
        send the user back to the home page.
      */
      if(store.getters.getUser != null) {
        next();
      } else {
        next('/');
      }
    } else {
      next('/');
    }
  }

  if(store.getters.getUserLoadStatus() != 2) {
    store.dispatch('loadUser');
    store.watch(store.getters.getUserLoadStatus, function() {
      if(store.getters.getUserLoadStatus() == 2 || store.getters.getUserLoadStatus() == 3) {
        proceed();
      }
    });
  } else {
    proceed();
  }
}

function redirectIfAuthenticated(to, from, next) {
  if(store.getters.getUserLoadStatus() == 2) {
    next('/home');
  }
  next();
}

/*
    Makes a new VueRouter that we will use to run all of the routes
    for the app.
*/
export default new VueRouter({
    routes: [
      {
        path: '/',
        name: 'vistor',
        component: Vue.component('Visitor', require('./pages/Vistor.vue').default),
      },
      {
        path: '/login',
        name: 'login',
        component: Vue.component('Login', require('./pages/Login.vue').default),
        beforeEnter: redirectIfAuthenticated,
      },
      {
        path: '/register',
        name: 'register',
        component: Vue.component('Register', require('./pages/Register.vue').default),
        beforeEnter: redirectIfAuthenticated,
      },
      {
        path: '/reset-password',
        name: 'reset-password',
        component: Vue.component('ResetPassword', require('./pages/ResetPassword.vue').default),
        beforeEnter: redirectIfAuthenticated,
      },
      {
        path: '/reset-password-link/:token',
        name: 'reset-password-link',
        component: Vue.component('ResetPasswordLink', require('./pages/ResetPasswordLink.vue').default),
        beforeEnter: redirectIfAuthenticated,
      },
      {
        path: '/home',
        name: 'home',
        component: Vue.component('Home', require('./pages/Home.vue').default),
        beforeEnter: requireAuth,
      },
      {
        path: '/incomes',
        name: 'incomes',
        component: Vue.component('Incomes', require('./pages/incomes/Incomes.vue').default),
        beforeEnter: requireAuth,
      },
      {
        path: '/goals',
        name: 'goals',
        component: Vue.component('Goals', require('./pages/goals/Goals.vue').default),
        beforeEnter: requireAuth,
      },
    ],
});
