<template>
  <div id="modify-paycheck">
    <Modal :show="show" @hide="$emit('close')" id="modify-paycheck-modal" title="Edit Paycheck">
      <form @submit.prevent="onSave()">
        <div class="form-group">
          <label for="income_id">Income: </label>
          <select
            v-model.number="paycheck.income_id"
            id="income_id"
            disabled
            class="custom-select"
            :class="validationInputClasses(v$.income_id)"
          >
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
              <input
                v-if="projected"
                v-model="paycheck.amount_project"
                @blur="paycheck.amount_project = numberToString(paycheck.amount_project)"
                id="amount"
                type="text"
                placeholder="Amount"
                class="form-control"
                :class="validationInputClasses(v$.amount_project)"
              >
              <input
                v-else
                v-model="paycheck.amount"
                @blur="paycheck.amount = numberToString(paycheck.amount)"
                id="amount"
                type="text"
                placeholder="Amount"
                class="form-control"
                :class="validationInputClasses(v$.amount)"
              >
            </div>
            <div class="custom-control custom-checkbox">
              <input
                v-model="projected"
                @change="onCheckProjected()"
                id="projected"
                type="checkbox"
                class="custom-control-input"
              >
              <label class="custom-control-label" for="projected">Projected?</label>
            </div>
            <div v-if="!v$.amount.required || !v$.amount_project.required" class="invalid-feedback d-block">
              Amount is required
            </div>
            <div v-if="!v$.amount.validDecimal || !v$.amount_project.validDecimal" class="invalid-feedback d-block">
              Amount must be a valid decimal ($xxxx.xx)
            </div>
            <div v-if="(v$.amount.validDecimal && !v$.amount.notZero) || (v$.amount_project.validDecimal && !v$.amount_project.notZero)" class="invalid-feedback d-block">
              Amount must be greater than zero (0.00)
            </div>
          </div>
        </div>
        <div class="row">
          <div v-if="paycheck.notified_at == null || isNotifiable" class="col form-group">
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
        <div class="row">
          <div class="col" v-if="paycheck.notified_at != null">
            You've already been notified for this paycheck, if you change the paid on date to today or later, another notification will be sent on that day.
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
        <button class="btn btn-danger btn-sm" @click="onDelete()">
          Delete
        </button>
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
import { numberToString, copyObjectProperties } from '../../utils/main.js';
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
  id: null,
  income_id: null,
  amount_project: null,
  amount: null,
  notified_at: null,
  notify_when_paid: false,
  paid_on: null,
  created_at: "",
  updated_at: "",
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
    notZero,
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

eventBus.on('modify-paycheck', (paycheckObj) => {
  copyObjectProperties(paycheckObj, paycheck);
  if (paycheck.amount == null) {
    projected.value = true;
    paycheck.amount_project = numberToString(paycheck.amount_project);
  } else {
    projected.value = false;
    paycheck.amount = numberToString(paycheck.amount);
  }
  emit('open');
});

function onSave() {
  if (!v$.$invalid) {
    store.dispatch('editPaycheck', paycheck);
    emit('close');
  }
}

function onDelete() {
  eventBus.emit('delete-paycheck', paycheck);
  emit('close');
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
