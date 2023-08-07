/*
|-------------------------------------------------------------------------------
| routes.js
|-------------------------------------------------------------------------------
| Contains all of the routes for the application
*/

/*
    Imports Vue and VueRouter to extend with the routes.
*/
import { createRouter, createWebHashHistory } from 'vue-router';
import { store } from './store.js';
import Visitor from './pages/Vistor.vue';
import Login from './pages/Login.vue';
import Register from './pages/Register.vue';
import ResetPassword from './pages/ResetPassword.vue';
import ResetPasswordLink from './pages/ResetPasswordLink.vue';
import Home from './pages/Home.vue';
import Incomes from './pages/Incomes.vue';

/*
    This will cehck to see if the user is authenticated or not.
*/
function requireAuth(to, from) {
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
        return true;
      }
    }
    return false;
  }

  if(store.getters.getUserLoadStatus() != 2) {
    store.dispatch('loadUser');
    store.watch(store.getters.getUserLoadStatus, function() {
      if(store.getters.getUserLoadStatus() == 2 || store.getters.getUserLoadStatus() == 3) {
        return proceed();
      }
    });
  } else {
    return proceed();
  }
}

function redirectIfAuthenticated(to, from) {
  if(store.getters.getUserLoadStatus() == 2) {
    return false;
  }
}

/*
    Makes a new VueRouter that we will use to run all of the routes
    for the app.
*/
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'vistor',
      component: Visitor,
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      beforeEnter: redirectIfAuthenticated,
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
      beforeEnter: redirectIfAuthenticated,
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPassword,
      beforeEnter: redirectIfAuthenticated,
    },
    {
      path: '/reset-password-link/:token',
      name: 'reset-password-link',
      component: ResetPasswordLink,
      beforeEnter: redirectIfAuthenticated,
    },
    {
      path: '/home',
      name: 'home',
      component: Home,
      beforeEnter: requireAuth,
    },
    {
      path: '/incomes',
      name: 'incomes',
      component: Incomes,
      beforeEnter: requireAuth,
    },
  ],
});
