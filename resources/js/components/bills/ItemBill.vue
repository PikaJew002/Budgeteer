<template>
  <div
    :class="['card', highlight || stayHighlighted ? 'border-base shadow-lg' : '']"
    @mouseover="highlight = true"
    @mouseleave="highlight = false"
  >
    <div class="card-body">
      <div class="d-flex justify-content-between">
        <h5 class="card-title">
          {{ bill.name }}
        </h5>
        <h5 class="card-title">
          <!-- // @TODO switch from single bill-paycheck pairing to multi-pairing -->
          ${{ formatAmount(billPaychecks.length > 0 ? billPaychecks[0] : bill) }}
        </h5>
        <h5 v-if="billPaychecks.length > 0 && isAllPaid" class="card-title text-success">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52.917 52.917" height="26" width="26">
            <g fill="none" stroke="#28A745">
              <path d="M52.13 26.458A25.672 25.672 0 0126.458 52.13 25.672 25.672 0 01.786 26.458 25.672 25.672 0 0126.458.786 25.672 25.672 0 0152.13 26.458z" stroke-width="1.573"/><path stroke-width="1.605" d="M25.712 28.197L47.817 6.092l.674.674-22.105 22.105z"/>
              <path stroke-width="1.605" d="M15.761 18.246l.682-.681 9.951 9.95-.681.682z"/>
            </g>
          </svg>
        </h5>
        <h5 v-else-if="billPaychecks.length > 0 && !isAllPaid" class="card-title text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52.917 52.917" height="26" width="26">
            <g fill="none" stroke="#007BFF">
              <path d="M52.13 26.458A25.672 25.672 0 0126.458 52.13 25.672 25.672 0 01.786 26.458 25.672 25.672 0 0126.458.786 25.672 25.672 0 0152.13 26.458z" stroke-width="1.573"/>
              <path d="M26.309.744h.299v22.325h-.299z" stroke-width="1.487"/>
            </g>
          </svg>
        </h5>
        <h5 v-else class="card-title text-base">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52.917 52.917" height="26" width="26">
            <path d="M52.13 26.458A25.672 25.672 0 0126.458 52.13 25.672 25.672 0 01.786 26.458 25.672 25.672 0 0126.458.786 25.672 25.672 0 0152.13 26.458z" fill="none" stroke="#1D4880" stroke-width="1.573"/>
          </svg>
        </h5>
      </div>
      <div class="d-flex justify-content-between">
        <small v-if="billPaychecks.length > 0" class="text-muted">
          <template v-for="billPaycheck in billPaychecks" :key="otherIfNull(billPaycheck, 'amount', 'amount_project')">
            <span>
              ${{ formatAmount(billPaycheck) }} {{ isPaid(billPaycheck) ? "Paid" : "Scheduled" }} on
              {{ formatedDate(billPaycheck.paid_on === null ? getPaycheck(billPaycheck.paycheck_id).paid_on : billPaycheck.paid_on) }}
            </span>
          </template>
        </small>
        <small v-else class="text-muted">
          Due on {{ billDueOn }}
        </small>
        <small v-if="isLastBill" class="text-danger">Last Month</small>
      </div>
      <div v-if="highlight && !receivingPair" class="d-flex justify-content-between mt-2">
        <button v-if="billPaychecks.length > 0" type="button" class="btn btn-outline-base btn-sm" @click="onPairUpdate()">
          Update
        </button>
        <button v-else type="button" class="btn btn-outline-base btn-sm" @click="onPair()">
          Pair
        </button>
        <button class="btn btn-outline-sub1 btn-sm" @click="onModify()">Edit</button>
      </div>
      <div v-if="receivingPair && !canStopPair" class="text-center mt-2">
        <button type="button" class="btn btn-outline-base btn-sm" @click="onPair()">Pair</button>
      </div>
      <div v-if="canStopPair" class="text-center mt-2">
        <button type="button" class="btn btn-outline-base btn-sm" @click="onStopPair()">Stop Pair</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, ref } from 'vue';
import { useStore } from 'vuex';
import moment from 'moment';
import { dateToFormatedString, dateToString, numberToString, otherIfNull } from '../../utils/main';


let props = defineProps({
  bill: {
    type: Object,
    required: true,
  },
  month: {
    type: Array,
    required: true,
  },
});

let eventBus = inject('eventBus');

let store = useStore();

let receivingPair = ref(false);
let canStopPair = ref(false);

let highlight = ref(false);
let stayHighlighted = ref(false);

let billPaychecks = computed(() => {
  return store.getters.getBillPaychecks.filter((bill_paycheck) => {
    return bill_paycheck.bill_id === props.bill.id;
  }).filter((bill_paycheck) => {
    return bill_paycheck.due_on.substr(0, 7) === dateToString(props.month[1], props.month[0]);
  });
});

let billDueOn = computed(() => {
  return dateToFormatedString(dateToString(props.month[1], props.month[0], props.bill.day_due_on));
});

let isAllPaid = computed(() => {
  return billPaychecks.value.length > 0 ? billPaychecks.value.reduce((acc, bill_paycheck) => {
    return acc && bill_paycheck.paid_on !== null;
  }, true) : false;
});

let endDate = computed(() => {
    return moment([props.month[1], props.month[0] - 1]).endOf('month').format("YYYY-MM-DD")
});

let isLastBill = computed(() => {
    return moment(endDate.value).isSame(props.bill.end_on, 'month');
});

eventBus.on('paycheck-pair-start', () => {
  receivingPair.value = true;
  stayHighlighted.value = true;
});

eventBus.on('bill-pair-start', ({ billObj, monthArr }) => {
  if (billObj.id == props.bill.id && props.month[0] == monthArr[0] && props.month[1] == monthArr[1]) {
    canStopPair.value = true;
  }
});

eventBus.on('bill-pair-end', () => {
  receivingPair.value = false;
  stayHighlighted.value = false;
});

eventBus.on('paycheck-pair-end', () => {
  if (receivingPair.value) {
    receivingPair.value = false;
    canStopPair.value = false;
    stayHighlighted.value = false;
  }
});

function onModify() {
  eventBus.emit('modify-bill', props.bill);
}

function onPairUpdate() {
  // @TODO switch from single bill-paycheck pairing to multi-pairing
  eventBus.emit('pair-update', {
    billObj: props.bill,
    paycheckObj: getPaycheck(billPaychecks.value[0].paycheck_id),
  });
}

function onPair() {
  if (!receivingPair.value) {
    // case: the bill is selected first
    receivingPair.value = true;
    stayHighlighted.value = true;
    eventBus.emit('bill-pair-start', {
      billObj: props.bill,
      monthArr: props.month,
    });
  } else {
    eventBus.emit('bill-pair-end', {
      billObj: props.bill,
      monthArr: props.month,
      pairableType: 'bill',
    });
  }
}

function onStopPair() {
  canStopPair.value = false;
  eventBus.emit('paycheck-pair-end', null);
}

function getPaycheck(id) {
  return store.getters.getPaycheck(id) || { paid_on: null };
}

function isPaid(bill_paycheck) {
  return bill_paycheck.paid_on !== null;
}

function formatAmount(obj) {
  return numberToString(otherIfNull(obj, 'amount', 'amount_project'));
}

function formatedDate(date) {
  return moment(date).format('ddd, MMM D');
}
</script>
