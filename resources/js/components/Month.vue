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
      Collection
    },
    props: {
      month: {
        type: Number,
        required: true
      },
      year: {
        type: Number,
        required: true
      },
      isSelected: {
        type: Boolean,
        default: false
      },
      incomesshown: {
        type: Number,
        required: true
      },
      showmakebill: {
        type: Boolean,
        required: true
      },
      showmakepaycheck: {
        type: Boolean,
        required: true
      }
    },

    created() {

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
          ['December', 31]
        ],
        showMakePaycheckForm: false
      };
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
        */
      incomes() {
        return this.$store.getters.getIncomes;
      },
      /**
        Gets the incomes selected
        */
      incomesSelected() {
        if(this.incomesshown == "0") return this.incomes;
        return this.incomes.filter((income) => {
          return income.id == this.incomesshown;
        });
      },
      /**
        Gets the paychecks for the incomes shown
        */
      paychecks() {
        let paycheckArr = [];
        for(let i in this.incomesSelected) {
          for(let j in this.incomesSelected[i].paychecks) {
            paycheckArr.push(this.incomesSelected[i].paychecks[j]);
          }
        }
        return paycheckArr;
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
        Gets the incomes load status
        */
      incomesLoadStatus() {
        return this.$store.getters.getIncomesLoadStatus;
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

    methods: {
      itemSelected(id, event) {

      },

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
        EventBus.$emit('make-bill', this.startDate);
      },

      makePaycheck() {
        EventBus.$emit('make-paycheck', [this.incomesshown, this.startDate]);
      }
    }
  }
</script>
