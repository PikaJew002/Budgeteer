<template>
  <div
    :class="['card', highlight || stayHighlighted ? 'border-base shadow-lg' : '']"
    @mouseover="highlight = true"
    @mouseleave="highlight = false"
  >
    <div class="card-body">
      <template v-if="!billsAndContributionsMode">
        <div class="d-flex justify-content-between">
          <h5>{{ income.name }}</h5>
          <h5>{{ dateToFormatedString(paycheck.paid_on) }}</h5>
        </div>
        <div class="d-flex justify-content-between mb-2">
          <h5>${{ numberToString(otherIfNull(paycheck, 'amount', 'amount_project')) }}</h5>
          <h5>${{ leftOver }}</h5>
        </div>
        <div v-if="highlight && !receivingPair" class="d-flex justify-content-between mt-2">
          <button v-if="billPaychecks.length > 0"
                  type="button"
                  class="btn btn-outline-base btn-sm"
                  @click="billsAndContributionsMode = true">Bills</button>
          <button v-else
                  type="button"
                  class="btn btn-outline-base btn-sm"
                  @click="onPair()">Pair</button>
          <button class="btn btn-outline-sub1 btn-sm" @click="onModify()">Edit</button>
        </div>
        <div v-if="receivingPair && !canStopPair" class="text-center mt-2">
          <button type="button"
                  class="btn btn-outline-base btn-sm"
                  @click="onPair()">Pair</button>
        </div>
        <div v-if="canStopPair" class="text-center mt-2">
          <button type="button"
                  class="btn btn-outline-base btn-sm"
                  @click="onStopPair()">Stop Pair</button>
        </div>
      </template>
      <template v-else>
        <div v-for="billPaycheck in billPaychecks" class="d-flex justify-content-between mb-2">
          <span>
            {{ getBill(billPaycheck.bill_id).name }}
          </span>
          <span>
            {{ dateToFormatedString(billPaycheck.due_on, "MMM") }}
          </span>
          <span>
            ${{ numberToString(otherIfNull(billPaycheck, 'amount', 'amount_project')) }}
          </span>
          <button type="button"
                  class="btn btn-outline-base btn-sm"
                  @click="onPairUpdateBill(getBill(billPaycheck.bill_id))">Update</button>
        </div>
        <div v-if="highlight && !receivingPair" class="d-flex justify-content-between mt-2">
          <button type="button" class="btn btn-outline-base btn-sm" @click="billsAndContributionsMode = false">Paycheck</button>
          <button type="button" class="btn btn-outline-base btn-sm" @click="onPair()">Pair</button>
        </div>
        <div v-if="receivingPair && !canStopPair" class="text-center mt-2">
          <button type="button"
                  class="btn btn-outline-base btn-sm"
                  @click="onPair()">Pair</button>
        </div>
        <div v-if="canStopPair" class="text-center mt-2">
          <button type="button"
                  class="btn btn-outline-base btn-sm"
                  @click="onStopPair()">Stop Pair</button>
        </div>
      </template>
    </div>
  </div>
</template>

<style>
  .elips {
    transform: rotate(-90deg);
  }
  .elips:after {
    content: '\2807';
    font-size: 15px;
  }
</style>

<script setup>
import { ref, computed, inject, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import { numberToString, otherIfNull, dateToFormatedString } from '../../utils/main.js';

let props = defineProps({
  paycheck: {
    type: Object,
    required: true,
  },
});

let eventBus = inject('eventBus');

let store = useStore();

let receivingPair = ref(false);
let canStopPair = ref(false);
let billsAndContributionsMode = ref(false);

let highlight = ref(false);
let stayHighlighted = ref(false);

let income = computed(() => {
  return store.getters.getIncome(props.paycheck.income_id) || {};
});

// BillPaychecks where paycheck_id is Paycheck.id
let billPaychecks = computed(() => {
  return store.getters.getBillPaychecks.filter((billPaycheck) => {
    return billPaycheck.paycheck_id == props.paycheck.id;
  });
});

let leftOver = computed(() => {
  let total = Number(otherIfNull(props.paycheck, 'amount', 'amount_project'));
  billPaychecks.value.forEach((billPaycheck) => {
    total -= Number(otherIfNull(billPaycheck, 'amount', 'amount_project'));
  });
  return total.toFixed(2);
});

eventBus.on('bill-pair-start', () => {
  receivingPair.value = true;
  stayHighlighted.value = true;
});

eventBus.on('paycheck-pair-start', (paycheckObj) => {
  if (paycheckObj.id === props.paycheck.id) {
    canStopPair.value = true;
  }
});

eventBus.on('paycheck-pair-end', () => {
  receivingPair.value = false;
  stayHighlighted.value = false;
});

eventBus.on('bill-pair-end', () => {
  if (receivingPair.value) {
    receivingPair.value = false;
    canStopPair.value = false;
    stayHighlighted.value = false;
    billsAndContributionsMode.value = false;
  }
});

onBeforeUnmount(() => {
  eventBus.off('bill-pair-start');
  eventBus.off('paycheck-pair-start');
  eventBus.off('paycheck-pair-end');
  eventBus.off('bill-pair-end');
});

function onModify() {
  eventBus.emit('modify-paycheck', props.paycheck);
}

function onPairUpdateBill(bill) {
  eventBus.emit('pair-update', {
    billObj: bill,
    paycheckObj: props.paycheck,
  });
}

function onPair() {
  if (!receivingPair.value) {
    // case: the paycheck is selected first
    receivingPair.value = true;
    stayHighlighted.value = true;
    eventBus.emit('paycheck-pair-start', props.paycheck);
  } else {
    // case: the paycheck is selected last
    eventBus.emit('paycheck-pair-end', props.paycheck);
  }
}

function onStopPair() {
  canStopPair.value = false;
  eventBus.emit('bill-pair-end', { pairableType: null });
}

function getBill(bill_id) {
  return store.getters.getBill(bill_id);
}
</script>
