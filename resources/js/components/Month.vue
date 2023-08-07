<template>
  <div class="card mb-2 mt-2" :class="{ 'border-base': isSelected }" style="display: flex;">
    <div class="card-body">
      <h5 class="card-title">{{ monthsStr }}</h5>
      <div class="card">
        <div class="card-body">
          <div class="d-flex justify-content-between">
            Bills <button type="button" :disabled="showMakeBill" class="btn btn-outline-base btn-sm" @click="makeBill()">+</button>
          </div>
          <hr>
          <Collection
            type="bill"
            :items="billsMonthSorted"
            :month="[month, year]"
            :size="1"
          />
        </div>
      </div>
      <div class="card">
        <div class="card-body">
          <div class="d-flex justify-content-between">
            Paychecks <button type="button" :disabled="showMakePaycheck" class="btn btn-outline-base btn-sm" @click="makePaycheck()">+</button>
          </div>
          <hr>
          <Collection
            type="paycheck"
            :items="paychecksMonthSorted"
            :size="1"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import Collection from './Collection.vue';
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
    showMakeBill: {
      type: Boolean,
      required: true,
    },
    showMakePaycheck: {
      type: Boolean,
      required: true,
    },
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
      this.$eventBus.emit('make-paycheck', this.startDate);
    },
  },
  computed: {
    monthsStr() {
      return moment([this.year, this.month-1]).format('MMMM') + ' ' + this.year;
    },
    /**
      Date of the first day of the month
      */
    startDate() {
      return moment([this.year, this.month-1]).startOf('month').format("YYYY-MM-DD");
    },
    /**
      Date of the last day of the month
      */
    endDate() {
      return moment([this.year, this.month-1]).endOf('month').format("YYYY-MM-DD");
    },
    /**
      Gets the incomes
      @return array
      */
    incomes() {
      return this.$store.getters.getIncomes;
    },
    /**
      Gets the paychecks for the incomes shown
      @return array
      */
    paychecks() {
      return this.$store.getters.getPaychecks;
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
