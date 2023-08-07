import { createStore } from 'vuex';
import { incomes } from './modules/incomes.js'
import { paychecks } from './modules/paychecks.js'
import { bills } from './modules/bills.js'
import { bill_paycheck } from './modules/bill-paycheck.js'
import { users } from './modules/users.js'

export const store = createStore({
    modules: {
      incomes,
      paychecks,
      bills,
      bill_paycheck,
      users,
    }
});
