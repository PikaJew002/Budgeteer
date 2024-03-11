<template>
  <div id="make-paycheck">
    <Modal :show="show" @hide="$emit('close')" id="make-paycheck-modal" title="Make Paycheck">
      <form @submit.prevent="onSave(paycheck)">
        <div class="form-group">
          <label for="income_id">Income: </label>
          <select class="custom-select"
                  id="income_id"
                  v-model.number="paycheck.income_id"
                  :class="validationInputClasses(v$.income_id)">
            <option :value="0">Please Select a Source of Income</option>
            <option v-for="income in incomes" :key="income.id" :value="income.id">
              {{ income.name }}
            </option>
          </select>
        </div>
        <div class="row">
          <div class="col form-group">
            <label for="amount">Amount: </label>
            <div class="input-group">
              <div class="input-group-prepend">
                <div class="input-group-text">$</div>
              </div>
              <input v-if="projected"
                     class="form-control"
                     id="amount"
                     type="text"
                     placeholder="Amount"
                     v-model="paycheck.amount_project"
                     @blur="paycheck.amount_project = numberToString(paycheck.amount_project)"
                     :class="validationInputClasses(v$.amount_project)">
              <input v-else
                     class="form-control"
                     id="amount"
                     type="text"
                     placeholder="Amount"
                     v-model="paycheck.amount"
                     @blur="paycheck.amount = numberToString(paycheck.amount)"
                     :class="validationInputClasses(v$.amount)">
            </div>
            <div class="custom-control custom-checkbox">
              <input class="custom-control-input"
                     id="projected"
                     type="checkbox"
                     v-model="projected"
                     @change="onCheckProjected()">
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
            <div class="custom-control custom-checkbox">
              <input class="custom-control-input"
                     id="notify"
                     type="checkbox"
                     v-model="paycheck.notify_when_paid"
                     :disabled="!isNotifiable">
              <label class="custom-control-label" for="notify">Notify when paid?</label>
            </div>
            <span v-if="isNotifiable">You'll receive an email</span>
            <span v-else class="text-muted">You can't recieve a notification from the past...</span>
          </div>
        </div>
        <div class="form-group">
          <label for="paid_on">Paid On: </label>
          <input class="form-control"
                 id="paid_on"
                 type="date"
                 placeholder="mm/dd/yyyy"
                 v-model.date="paycheck.paid_on"
                 @change="onPaidOnChange()"
                 :class="validationInputClasses(v$.paid_on)">
          <div v-if="!v$.paid_on.required" class="invalid-feedback">
            Paid On is required (valid date)
          </div>
        </div>
      </form>
      <template v-slot:modal-footer>
        <button class="btn btn-sub1 btn-sm" @click="$emit('close')">
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
import { ref, reactive, computed, inject } from 'vue';
import { useStore } from 'vuex';
import { useVuelidate } from '@vuelidate/core';
import { helpers, required, requiredIf, minValue } from '@vuelidate/validators';
import moment from 'moment';
import Modal from '../Modal.vue';
import { numberToString, emptyStringToNull } from '../../utils/main.js';
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

let projected = ref(false);

let paycheck = reactive({
  income_id: null,
  amount_project: null,
  amount: null,
  notify_when_paid: false,
  paid_on: "",
});

let v$ = useVuelidate({
  income_id: {
    required,
    minValue: minValue(1),
  },
  amount_project: {
    required: requiredIf(function () {
      return !paycheck.amount;
    }),
    validDecimal,
    notZero: (amount_project) => ((amount_project == "" || amount_project == null) || (Number(amount_project) > 0)),
  },
  amount: {
    required: requiredIf(function () {
      return !paycheck.amount_project;
    }),
    validDecimal,
    notZero,
  },
  paid_on: {
    required,
  },
}, paycheck);

let isNotifiable = computed(() => {
  return paycheck.paid_on && moment().isSameOrBefore(paycheck.paid_on, 'day');
});

let incomes = computed(() => {
  return store.getters.getIncomes;
});

eventBus.on('make-paycheck', (paid_on) => {
  paycheck.income_id = 0;
  paycheck.amount_project = null;
  paycheck.amount = null;
  paycheck.notify_when_paid = false;
  paycheck.paid_on = paid_on;
  projected.value = false;
  emit('open');
});

function onSave() {
  if (!v$.$invalid) {
    paycheck.amount = emptyStringToNull(paycheck.amount);
    paycheck.amount_project = emptyStringToNull(paycheck.amount_project);
    store.dispatch('addPaycheck', paycheck);
    emit('close');
  }
}

function onCheckProjected() {
  if (projected.value) {
    paycheck.amount_project = paycheck.amount;
    paycheck.amount = null;
  } else {
    paycheck.amount = paycheck.amount_project;
    paycheck.amount_project = null;
  }
}

function onPaidOnChange() {
  if (paycheck.notify_when_paid && !isNotifiable.value) {
    paycheck.notify_when_paid = false;
  }
}
</script>
