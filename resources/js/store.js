import { createStore } from 'vuex';

/*
    Imports all of the modules used in the application to build the data store.
*/
import { incomes } from './modules/incomes.js'
import { paychecks } from './modules/paychecks.js'
import { bills } from './modules/bills.js'
import { bill_paycheck } from './modules/bill-paycheck.js'
import { users } from './modules/users.js'

/*
  Exports our data store.
*/
export const store = createStore({
    modules: {
      incomes,
      paychecks,
      bills,
      bill_paycheck,
      users,
    }
});
