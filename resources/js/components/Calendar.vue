<template>
  <div id="calendar">
    <MakeBill :show="bill.showMake" @open="bill.showMake = true" @close="bill.showMake = false;"/>
    <ModifyBill :show="bill.showModify" @open="bill.showModify = true" @close="bill.showModify = false"/>
    <DeleteBill :show="bill.showDelete" @open="bill.showDelete = true" @close="bill.showDelete = false"/>
    <MakePaycheck :show="paycheck.showMake" @open="paycheck.showMake = true" @close="paycheck.showMake = false"/>
    <ModifyPaycheck :show="paycheck.showModify" @open="paycheck.showModify = true" @close="paycheck.showModify = false"/>
    <DeletePaycheck :show="paycheck.showDelete" @open="paycheck.showDelete = true" @close="paycheck.showDelete = false"/>
    <PairPaycheck :show="showPair" @open="showPair = true" @close="showPair = false"/>
    <div class="row">
      <div class="col-md-1 d-flex justify-content-between justify-content-sm-start">
        <button type="button" class="btn btn-base btn-lg btn-block h-100 w-auto d-inline-block" @click="monthDown()">❮</button>
        <button type="button" class="btn btn-base btn-lg btn-block h-100 w-auto d-inline-block d-sm-none" @click="monthUp()">❯</button>
      </div>
      <div class="col-md-10">
        <div class="row row-cols-1 row-cols-md-3">
          <Month
            v-for="index in month.months.length"
            :key="index - 1"
            :is-selected="index - 1 == selectedMonth"
            :month="month.months[index - 1][0]+1"
            :year="month.months[index - 1][1]"
            :show-make-bill="bill.showMake"
            :show-make-paycheck="paycheck.showMake"
          />
        </div>
      </div>
      <div class="col-md-1 d-flex justify-content-between justify-content-sm-end">
        <button type="button" class="btn btn-base btn-lg btn-block h-100 w-auto d-inline-block d-sm-none" @click="monthDown()">❮</button>
        <button type="button" class="btn btn-base btn-lg btn-block h-100 w-auto d-inline-block" @click="monthUp()">❯</button>
      </div>
    </div>
  </div>
</template>

<style>
.month-test-enter-active, .month-leave-active {
  transition: all 1s;
}
.month-test-enter, .month-leave-to /* .list-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: translateY(100%, 0);
}
.month-test-move {
  transition: transform 1s;
}
</style>

<script setup>
import { ref, reactive, computed } from 'vue';
import { cloneDeep } from 'lodash';
import Month from './Month.vue';
import MakeBill from './bills/MakeBill.vue';
import ModifyBill from './bills/ModifyBill.vue';
import DeleteBill from './bills/DeleteBill.vue';
import MakePaycheck from './paychecks/MakePaycheck.vue';
import ModifyPaycheck from './paychecks/ModifyPaycheck.vue';
import DeletePaycheck from './paychecks/DeletePaycheck.vue';
import PairPaycheck from './paychecks/PairPaycheck.vue';

let props = defineProps({
  totalMonths: {
    type: Number,
    default: function () {
      return 3;
    },
  },
});

let month = reactive({
  months: [],
});

let bill = reactive({
  showMake: false,
  showModify: false,
  showDelete: false,
});

let paycheck = reactive({
  showMake: false,
  showModify: false,
  showDelete: false,
});

let showPair = ref(false);

let selectedMonth = computed(() => {
  return (props.totalMonths - 1) / 2;
});

let nowMonth = new Date(Date.now()).getMonth();
let nowYear = new Date(Date.now()).getFullYear();

for (let i = 0; i < props.totalMonths; i++) {
  month.months[i] = indexToMonth(i);
}

function indexToMonth(index) {
  let returnMonth = [nowMonth - selectedMonth.value + index, nowYear];
  if (returnMonth[0] < 0) return [returnMonth[0] + 12, returnMonth[1] - 1];
  if (returnMonth[0] > 11) return [returnMonth[0] - 12, returnMonth[1] + 1];
  return returnMonth;
}

function monthUp() {
  let newMonths = cloneDeep(month.months);
  for (let i = 0; i < newMonths.length - 1; i++) {
    newMonths[i] = newMonths[i + 1];
  }
  if (newMonths[newMonths.length - 1][0] == 11) {
    newMonths[newMonths.length - 1] = [0, newMonths[newMonths.length - 1][1] + 1];
  } else {
    newMonths[newMonths.length - 1] = [newMonths[newMonths.length - 1][0] + 1, newMonths[newMonths.length - 1][1]];
  }
  month.months = newMonths;
}

function monthDown() {
  let newMonths = cloneDeep(month.months);
  for (let i = newMonths.length - 1; i > 0; i--) {
    newMonths[i] = newMonths[i - 1];
  }
  if (newMonths[0][0] == 0) {
    newMonths[0] = [11, newMonths[0][1] - 1];
  } else {
    newMonths[0] = [newMonths[0][0] - 1, newMonths[0][1]];
  }
  month.months = newMonths;
}
</script>
