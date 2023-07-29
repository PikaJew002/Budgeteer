<template>
  <div class="card mb-2 mt-2" :class="{ 'border-base': isSelected }" style="display: flex;">
    <div class="card-body">
      <h5 class="card-title">{{ monthsStr[(month - 1)][0] }} {{ year }}</h5>
      <div class="card">
        <div class="card-body">
          <div class="d-flex justify-content-between">
            Bills <button type="button" :disabled="showmakebill" class="btn btn-outline-base btn-sm" @click="makeBill()">+</button>
          </div>
          <hr>
          <collection :items="billsMonthSorted"
                      type="bill"
                      :month="[month, year]"
                      :size="1"></collection>
        </div>
      </div>
      <div class="card" v-if="contributionsMonth.length > 0">
        <div class="card-body">
          Contributions
          <hr>
          <collection :items="contributionsMonth"
                      type="contribution"
                      :month="[month, year]"
                      :size="1"></collection>
        </div>
      </div>
      <div class="card">
        <div class="card-body">
          <div class="d-flex justify-content-between">
            Paychecks <button type="button" :disabled="showmakepaycheck" class="btn btn-outline-base btn-sm" @click="makePaycheck()">+</button>
          </div>
          <hr>
          <collection :items="paychecksMonthSorted"
                      type="paycheck"
                      :size="1"></collection>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Collection from './Collection.vue';
  import { EventBus } from '../event-bus.js';
  import moment from 'moment';
  export default {
    components: {
      Collection,
    },
    props: {
      month: {
        type: Number,
        required: true,
      },
      year: {
        type: Number,
        required: true,
      },
      isSelected: {
        type: Boolean,
        default: false,
      },
      incomesshown: {
        type: Number,
        required: true,
      },
      showmakebill: {
        type: Boolean,
        required: true,
      },
      showmakepaycheck: {
        type: Boolean,
        required: true,
      },
    },
    data() {
      return {
        monthsStr: [
          ['January', 31],
          ['Febuary', 28],
          ['March', 31],
          ['April', 30],
          ['May', 31],
          ['June', 30],
          ['July', 31],
          ['August', 31],
          ['September', 30],
          ['October', 31],
          ['November', 30],
          ['December', 31],
        ],
      };
    },
    methods: {
      comparePaychecks(a, b) {
        let comparison = 0;
        if(moment(a.paid_on).isBefore(b.paid_on)) {
          comparison = -1;
        } else if (moment(a.paid_on).isAfter(b.paid_on)) {
          comparison = 1;
        }
        return comparison;
      },
      compareBills(a, b) {
        if(a == null || b == null) {
          return 0;
        }
        let comparison = 0;
        if(a.day_due_on < b.day_due_on) {
          comparison = -1;
        } else if (a.day_due_on > b.day_due_on) {
          comparison = 1;
        }
        return comparison;
      },
      makeBill() {
        this.$eventBus.emit('make-bill', this.startDate);
      },
      makePaycheck() {
        this.$eventBus.emit('make-paycheck', [this.incomesshown, this.startDate]);
      },
    },
    computed: {
      /**
        Date of the first day of the month
        */
      startDate() {
        return moment([this.year, this.month-1, 1]).format("YYYY-MM-DD");
      },
      /**
        Date of the last day of the month
        */
      endDate() {
        return moment([this.year, this.month-1 , this.monthsStr[this.month - 1][1]]).format("YYYY-MM-DD");
      },
      /**
        Gets the incomes
        @return array
        */
      incomes() {
        return this.$store.getters.getIncomes;
      },
      /**
        Gets the incomes selected
        @return array
        */
      incomesSelected() {
        if(this.incomesshown == "0") return this.incomes;
        return this.incomes.filter((income) => {
          return income.id == this.incomesshown;
        });
      },
      /**
        Gets the ids of the incomes selected
        @return array
        */
      incomesSelectedIds() {
        return this.incomesSelected.reduce((ids, income) => {
          ids.push(income.id);
          return ids;
        }, []);
      },
      /**
        Gets the paychecks for the incomes shown
        @return array
        */
      paychecks() {
        return this.$store.getters.getPaychecks.filter((paycheck) => {
          return this.incomesSelectedIds.includes(paycheck.income_id);
        });
      },
      /**
        Gets the paychecks that fall within "this" month (see startDate and endDate)
        */
      paychecksMonth() {
        return this.paychecks.filter((paycheck) => {
          return moment(paycheck.paid_on).isBetween(this.startDate, this.endDate, 'month', "[]");
        });
      },
      /**
        Gets the paychecks that fall within "this" month, sorted
        */
      paychecksMonthSorted() {
        return this.paychecksMonth.sort(this.comparePaychecks);
      },
      /**
        Gets the incomes
        */
      goals() {
        return this.$store.getters.getGoals;
      },
      /**
        Gets the incomes
        */
      contributions() {
        return this.$store.getters.getContributions;
      },
      /**
        Gets the contributions that fall within "this" month (see startDate and endDate)
        */
      contributionsMonth() {
        return this.contributions.filter((contribution) => {
          return moment(this.startDate).isSameOrBefore(contribution.end_on) && moment(this.endDate).isSameOrAfter(contribution.start_on);
        });
      },
      /**
        Gets the bills
        */
      bills() {
        return this.$store.getters.getBills;
      },
      /**
        Gets the bills that fall within "this" month (see startDate and endDate)
        */
      billsMonth() {
        return this.bills.filter((bill) => {
          return moment(this.startDate).isSameOrBefore(bill.end_on) && moment(this.endDate).isSameOrAfter(bill.start_on);
        });
      },
      /**
        Gets the paychecks that fall within "this" month, sorted
        */
      billsMonthSorted() {
        return this.billsMonth.sort(this.compareBills);
      },
    },
  }
</script>
