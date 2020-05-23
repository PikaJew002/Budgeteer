/*
    Imports Vue and Vuex
*/
import Vue from 'vue'
import Vuex from 'vuex'

/*
    Initializes Vuex on Vue.
*/
Vue.use( Vuex )

/*
    Imports all of the modules used in the application to build the data store.
*/
import { goals } from './modules/goals.js'
import { incomes } from './modules/incomes.js'
import { paychecks } from './modules/paychecks.js'
import { contribution_paycheck } from './modules/contribution-paycheck.js'
import { bills } from './modules/bills.js'
import { bill_paycheck } from './modules/bill-paycheck.js'
import { users } from './modules/users.js'

/*
  Exports our data store.
*/
export default new Vuex.Store({
    modules: {
      goals,
      incomes,
      paychecks,
      contribution_paycheck,
      bills,
      bill_paycheck,
      users,
    }
});
