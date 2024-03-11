<template>
  <div id="pair-paycheck">
    <!-- Pair was successful alert -->
    <Alert
      dismissible
      :show="message.show"
      :duration="message.duration"
      :variant="message.variant"
      @dismissed="message.show = false"
    >
     {{ message.message }}
    </Alert>
    <!-- Pair started alert -->
    <Alert
      variant="success"
      dismissible
      :show="showPairAlert"
      @dismissed="onDismissAlert()"
    >
      Select a {{ type == null ? "bill" : "paycheck" }} to pair with this {{ type == null ? "paycheck" : "bill" }}
    </Alert>
    <Modal :show="show" @hide="onHideModal()" id="pair-paycheck-modal">
      <template v-slot:modal-header>
        <h5>{{ (isUpdate ? 'Update' : 'Pair') }} Bill-Paycheck</h5>
        <button class="close" type="button" aria-label="Close" @click="onClose()">
          <span aria-hidden="true">&times;</span>
        </button>
      </template>
      <form @submit.prevent="onSave()" v-if="paycheck != null && bill != null">
        <div class="row">
          <div class="col">
            <h5>{{ income.name  }} ${{ otherIfNull(paycheck, 'amount', 'amount_project') }}</h5>
            <small class="text-muted mb-0">Paid on: {{ paycheck_paid_on }}</small><br />
            <small class="text-muted mb-0">Left over: ${{ paycheckLeft }}</small>
          </div>
          <div class="col form-group">
            <h5>{{ bill.name }}</h5>
            <label class="sr-only" for="amount">Amount</label>
            <div class="input-group">
              <div class="input-group-prepend">
                <div class="input-group-text">$</div>
              </div>
              <input v-if="projected"
                     class="form-control"
                     id="amount"
                     type="text"
                     placeholder="Amount"
                     v-model="pair.amount_project"
                     @blur="pair.amount_project = numberToString(pair.amount_project)"
                     :class="validationInputClasses(v$.amount_project)">
              <input v-else
                     class="form-control"
                     id="amount"
                     type="text"
                     placeholder="Amount"
                     v-model="pair.amount"
                     @blur="pair.amount = numberToString(pair.amount)"
                     :class="validationInputClasses(v$.amount)">
            </div>
            <div class="custom-control custom-checkbox">
              <input class="custom-control-input"
                     id="projected"
                     type="checkbox"
                     v-model="projected"
                     @change="onCheck()">
              <label class="custom-control-label" for="projected">Projected?</label>
            </div>
            <div v-if="!v$.amount.required || !v$.amount_project.required" class="invalid-feedback d-block">
              Amount is required
            </div>
            <div v-if="!v$.amount.validDecimal || !v$.amount_project.validDecimal" class="invalid-feedback d-block">
              Amount must be a valid decimal ($xxxx.xx)
            </div>
            <div v-if="(v$.amount.validDecimal && !v$.amount.notZero) || (v$.amount_project.validDecimal && !v$.amount_project.notZero)" class="invalid-feedback d-block">
              Amount must be greater than zero (0)
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col form-group">
            <label for="due_on">Due on: </label>
            <input class="form-control"
                   id="due_on"
                   type="date"
                   v-model="pair.due_on"
                   :class="validationInputClasses(v$.due_on)">
            <div v-if="!v$.due_on.required" class="invalid-feedback">
              Due On is required
            </div>
          </div>
          <div class="col form-group">
            <label for="paid_on">Paid on: </label>
            <input class="form-control"
                   id="paid_on"
                   type="date"
                   v-model="pair.paid_on"
                   :class="validationInputClasses(v$.paid_on)">
            <div v-if="!v$.paid_on.maxValue" class="invalid-feedback">
              Paid On must be before or on the date due
            </div>
          </div>
        </div>
      </form>
      <template v-slot:modal-footer>
        <button v-if="isUpdate" class="btn btn-danger btn-sm" @click="onDeletePair()">
          Delete
        </button>
        <button class="btn btn-sub1 btn-sm" @click="onClose()">
          Cancel
        </button>
        <button class="btn btn-base btn-sm" @click="onSave()">
          Save
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import { useVuelidate } from '@vuelidate/core';
import { helpers, required, requiredIf, maxValue } from '@vuelidate/validators';
import Alert from '../Alert.vue';
import Modal from '../Modal.vue';
import { dateToFormatedString, dateToString, emptyStringToNull, numberToString, otherIfNull } from '../../utils/main.js';
import { notZero, validationInputClasses } from '../../utils/validation.js';
const validDecimal = helpers.regex(/^\d{0,4}(\.\d{0,2})?$/);

let props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
});

let emit = defineEmits(['open', 'close']);

let eventBus = inject('eventBus');

let store = useStore();

let message = reactive({
  show: false,
  variant: 'success',
  duration: 2,
  message: '',
});

let projected = ref(false);
let isUpdate = ref(false);
let showPairAlert = ref(false);
let type = ref(null);
let month = ref(null);
let year = ref(null);
let bill = reactive({
  id: null,
  name: '',
  amount: null,
  day_due_on: '',
});
let paycheck = reactive({
  id: null,
  income_id: null,
  amount: null,
  amount_project: null,
  paid_on: '',
});
let pair = reactive({
  bill_id: null,
  paycheck_id: null,
  amount: null,
  amount_project: null,
  due_on: '',
  paid_on: '',
});

let v$ = useVuelidate({
  amount_project: {
    required: requiredIf(() => !pair.amount),
    validDecimal,
    notZero,
  },
  amount: {
    required: requiredIf(() => !pair.amount_project),
    validDecimal,
    notZero,
  },
  due_on: {
    required,
  },
  paid_on: {
    maxValue,
  },
}, pair);

eventBus.on('paycheck-pair-start', (paycheckObj) => {
  paycheck.id = paycheckObj.id;
  paycheck.income_id = paycheckObj.income_id;
  paycheck.amount = paycheckObj.amount;
  paycheck.amount_project = paycheckObj.amount_project;
  paycheck.paid_on = paycheckObj.paid_on;
  pair.paycheck_id = paycheckObj.id;
  type.value = null; // paycheck was selected first
  showPairAlert.value = true;
});

eventBus.on('bill-pair-start', ({ billObj, monthArr }) => {
  type.value = 'bill'; // bill or contribution (pairable) was selected first
  bill.id = billObj.id;
  bill.amount = billObj.amount;
  bill.day_due_on = billObj.day_due_on;
  month.value = monthArr[0];
  year.value = monthArr[1];
  pair.bill_id = bill.id;
  showPairAlert.value = true;
});

eventBus.on('paycheck-pair-end', (paycheckObj) => {
  if (paycheckObj == null) {
    showPairAlert.value = false;
    onHideModal();
    return;
  }
  paycheck.id = paycheckObj.id;
  paycheck.income_id = paycheckObj.income_id;
  paycheck.amount = paycheckObj.amount;
  paycheck.amount_project = paycheckObj.amount_project;
  paycheck.paid_on = paycheckObj.paid_on;
  pair.paycheck_id = paycheckObj.id;
  pair.amount = numberToString(bill.amount);
  pair.due_on = dateToString(year.value, month.value, bill.day_due_on == null ? 1 : bill.day_due_on);
  pair.paid_on = '';
  showPairAlert.value = false;
  emit('open');
});

eventBus.on('bill-pair-end', ({ billObj, monthArr, pairableType }) => {
  if (pairableType === null) {
    showPairAlert.value = false;
    onHideModal();
    return;
  }
  month.value = monthArr[0];
  year.value = monthArr[1];
  type.value = 'bill';
  bill.id = billObj.id;
  bill.amount = billObj.amount;
  bill.day_due_on = billObj.day_due_on;
  pair.bill_id = bill.id;
  pair.amount = numberToString(bill.amount);
  pair.due_on = dateToString(year.value, month.value, bill.day_due_on == null ? 1 : bill.day_due_on);
  showPairAlert.value = false;
  emit('open');
});

eventBus.on('pair-update', ({ billObj, paycheckObj }) => {
  isUpdate.value = true;
  type.value = 'bill'; // is bill or contribution
  bill.id = billObj.id;
  bill.amount = billObj.amount;
  bill.day_due_on = billObj.day_due_on;
  paycheck.id = paycheckObj.id;
  paycheck.income_id = paycheckObj.income_id;
  paycheck.amount = paycheckObj.amount;
  paycheck.amount_project = paycheckObj.amount_project;
  paycheck.paid_on = paycheckObj.paid_on;
  pair.bill_id = bill.id;
  pair.paycheck_id = paycheck.id;
  let pivotModel = store.getters.getBillPaycheck(bill.id, paycheck.id);
  pair.paid_on = pivotModel.paid_on;
  pair.due_on = pivotModel.due_on;
  projected.value = pivotModel.amount == null;
  pair.amount = emptyStringToNull(numberToString(pivotModel.amount));
  pair.amount_project = emptyStringToNull(numberToString(pivotModel.amount_project));
  emit('open');
});

let income = computed(() => {
  if (paycheck.id === null) return {};
  return store.getters.getIncome(paycheck.income_id);
});

let billPaychecks = computed(() => {
  if (paycheck.id === null || bill.id === null) return [];
  return store.getters.getBillPaychecks.filter((bill_paycheck) => {
    return bill_paycheck.paycheck_id === paycheck.id;
  });
});

let paycheckLeft = computed(() => {
  if (paycheck.id === null) return 0;
  let total = otherIfNull(paycheck, 'amount', 'amount_project');
  billPaychecks.value.forEach((bill_paycheck) => {
    if (bill_paycheck.bill_id !== pair.bill_id) {
      total -= otherIfNull(bill_paycheck, 'amount', 'amount_project');
    }
  });
  let amount = otherIfNull(pair, 'amount', 'amount_project')
  if (amount !== "") {
    total -= Number(amount);
  }
  return total.toFixed(2);
});

let paycheck_paid_on = computed(() => {
  if (paycheck.id === null) return '';
  return dateToFormatedString(paycheck.paid_on, 'ddd, MMM D');
});

onBeforeUnmount(() => {
  eventBus.off('paycheck-pair-start');
  eventBus.off('bill-pair-start');
  eventBus.off('paycheck-pair-end');
  eventBus.off('bill-pair-end');
  eventBus.off('pair-update');
});

function showAlert(variant, message, duration = 2) {
  message.variant = variant;
  message.message = message;
  message.duration = duration;
  message.show = true;
}

function onDismissAlert() {
  // if paycheck is null
  if (paycheck.id === null) {
    onHideModal();
    eventBus.emit('paycheck-pair-end', null);
    showPairAlert.value = false;
    return;
  }
  // if pairable entity (bill) is not selected
      // OR
  // if pairable entity (bill) is null
  if (type.value === null || bill.id === null) {
    onHideModal();
    eventBus.emit('bill-pair-end', { pairableType: null });
    showPairAlert.value = false;
    return;
  }
  // if the pairable entity (bill) is already paired to the paycheck
  if (store.getters.getBillPaycheck(bill.id, paycheck.id) !== undefined) {
    showPairAlert.false;
    showAlert('warning', 'The bill and paycheck selected are already paired.');
    onHideModal();
    return;
  }
  pair.amount = numberToString(pair.amount);
  showPairAlert.value = false;
  emit('open');
}

function onSave() {
  if (!v$.$invalid) {
    pair.paid_on = emptyStringToNull(pair.paid_on);
    store.dispatch(`${isUpdate.value ? 'modify' : 'attach'}BillPaycheck`, pair);
    onClose();
  }
}

function onClose() {
  emit('close');
  isUpdate.value = false;
}

function onDeletePair() {
  store.dispatch('detachBillPaycheck', pair);
  onClose();
}

function onHideModal() {
  emit('close');
  showPairAlert.value = false;
  isUpdate.value = false;
  type.value = null;
  projected.value = false;

  bill.id = null;
  bill.amount = null;
  bill.day_due_on = '';

  paycheck.id = null;
  paycheck.income_id = null;
  paycheck.paid_on = '';

  pair.bill_id = null;
  pair.paycheck_id = null;
  pair.amount = null;
  pair.amount_project = null;
  pair.due_on = '';
  pair.paid_on = '';
}

function onCheck() {
  if (projected.value) {
    pair.amount_project = pair.amount;
    pair.amount = null;
  } else {
    pair.amount = pair.amount_project;
    pair.amount_project = null;
  }
}
</script>
