<template>
  <div class="card mb-2 mt-2" :class="{ 'border-base': isSelected }" style="display: flex;">
    <div class="card-body">
      <h5 class="card-title">{{ monthsStr }}</h5>
      <div class="card">
        <div class="card-body">
          <div class="d-flex justify-content-between">
            Bills <button ref="makebill" type="button" :disabled="showMakeBill" class="btn btn-outline-base btn-sm" @click="makeBill()">+</button>
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
            Paychecks <button ref="makepaycheck" type="button" :disabled="showMakePaycheck" class="btn btn-outline-base btn-sm" @click="makePaycheck()">+</button>
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

<script setup>
import { computed, inject, ref } from 'vue';
import { useStore } from 'vuex';
import moment from 'moment';
import Collection from './Collection.vue';

let props = defineProps({
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
});

let eventBus = inject('eventBus');

let store = useStore();

let makebill = ref(null);

let makepaycheck = ref(null);

let monthsStr = computed(() => {
  return moment([props.year, props.month - 1]).format('MMMM') + ' ' + props.year;
});
/**
  Date of the first day of the month
  */
let startDate = computed(() => {
  return moment([props.year, props.month - 1]).startOf('month').format("YYYY-MM-DD");
});
/**
  Date of the last day of the month
  */
let endDate = computed(() => {
  return moment([props.year, props.month - 1]).endOf('month').format("YYYY-MM-DD");
});
/**
  Gets the paychecks that fall within "this" month, sorted
  */
let paychecksMonthSorted = computed(() => {
  return store.getters.getPaychecks.filter((paycheck) => {
    return moment(paycheck.paid_on).isBetween(startDate.value, endDate.value, 'month', "[]");
  }).sort(comparePaychecks);
});
/**
  Gets the paychecks that fall within "this" month, sorted
  */
let billsMonthSorted = computed(() => {
  return store.getters.getBills.filter((bill) => {
    return moment(startDate.value).isSameOrBefore(bill.end_on) && moment(endDate.value).isSameOrAfter(bill.start_on);
  }).sort(compareBills);
});

function comparePaychecks(a, b) {
  let comparison = 0;
  if (moment(a.paid_on).isBefore(b.paid_on)) {
    comparison = -1;
  } else if (moment(a.paid_on).isAfter(b.paid_on)) {
    comparison = 1;
  }
  return comparison;
}

function compareBills(a, b) {
  if (a == null || b == null) {
    return 0;
  }
  let comparison = 0;
  if (a.day_due_on < b.day_due_on) {
    comparison = -1;
  } else if (a.day_due_on > b.day_due_on) {
    comparison = 1;
  }
  return comparison;
}

function makeBill() {
  eventBus.emit('make-bill', startDate.value);
}

function makePaycheck() {
  eventBus.emit('make-paycheck', startDate.value);
}
</script>
