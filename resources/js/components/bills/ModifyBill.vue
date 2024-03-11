<template>
  <div id="modify-bill">
    <Modal :show="show" @hide="$emit('close')" id="modify-bill-modal" title="Edit Bill">
      <form @submit.prevent="onSave(bill)">
        <div class="form-group">
          <label for="name">Name: </label>
          <input class="form-control"
                 id="name"
                 type="text"
                 placeholder="Name"
                 v-model="bill.name"
                 :class="validationInputClasses(v$.name)">
          <div v-if="!v$.name.required" class="invalid-feedback">
            Name is required
          </div>
        </div>
        <div class="row">
          <div class="col form-group">
            <label for="amount">Amount: </label>
            <div class="input-group">
              <div class="input-group-prepend">
                <div class="input-group-text">$</div>
              </div>
              <input class="form-control"
                     id="amount"
                     type="text"
                     placeholder="Amount"
                     v-model="bill.amount"
                     @blur="bill.amount = numberToString(bill.amount)"
                     :class="validationInputClasses(v$.amount)">
            </div>
            <div v-if="!v$.amount.required" class="invalid-feedback">
              Amount is required
            </div>
            <div v-if="!v$.amount.validDecimal" class="invalid-feedback d-block">
              Amount must be a valid decimal ($xxxx.xx)
            </div>
            <div v-if="v$.amount.validDecimal && !v$.amount.notZero" class="invalid-feedback d-block">
              Amount must be greater than zero (0)
            </div>
          </div>
          <div class="col form-group">
            <label for="day_due_on">Day Due: </label>
            <input class="form-control"
                   id="day_due_on"
                   type="number"
                   placeholder="Day Due"
                   v-model.number="bill.day_due_on"
                   :class="validationInputClasses(v$.day_due_on)">
            <div v-if="!v$.day_due_on.integer || !v$.day_due_on.minValue || !v$.day_due_on.maxValue" class="invalid-feedback">
              Day Due On must be a valid integer day (1-31)
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col form-group">
            <label for="start_on">Start On Date: </label>
            <input class="form-control"
                   id="start_on"
                   type="date"
                   placeholder="mm/dd/yyyy"
                   v-model="bill.start_on"
                   :class="validationInputClasses(v$.start_on)">
            <div v-if="!v$.start_on.required" class="invalid-feedback">
              Start On is required (valid date)
            </div>
          </div>
          <div class="col form-group">
            <label for="end_on">End On Date: </label>
            <input class="form-control"
                   id="end_on"
                   type="date"
                   placeholder="mm/dd/yyyy"
                   v-model="bill.end_on"
                   :class="validationInputClasses(v$.end_on)">
            <div v-if="!v$.end_on.required" class="invalid-feedback">
              End On is required (valid date)
            </div>
            <div v-if="!v$.end_on.minDate" class="invalid-feedback">
              End On Date must be after the Start On Date
            </div>
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
import { reactive, inject } from 'vue';
import { useStore } from 'vuex';
import { useVuelidate } from '@vuelidate/core';
import { helpers, required, minValue, maxValue, integer } from '@vuelidate/validators';
import moment from 'moment';
import Modal from '../Modal.vue';
import { emptyStringToNull, numberToString, copyObjectProperties } from '../../utils/main.js';
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

let bill = reactive({
  id: null,
  name: "",
  amount: null,
  day_due_on: null,
  start_on: "",
  end_on: "",
  created_at: "",
  updated_at: "",
});

let v$ = useVuelidate({
  name: {
    required,
  },
  amount: {
    required,
    validDecimal,
    notZero,
  },
  day_due_on: {
    integer,
    minValue: minValue(1),
    maxValue: maxValue(31),
  },
  start_on: {
    required,
  },
  end_on: {
    required,
    minDate: (end_on) => (end_on == "" || moment(end_on).isAfter(bill.start_on)),
  },
}, bill);

eventBus.on('modify-bill', (billObj) => {
  copyObjectProperties(billObj, bill);
  bill.amount = emptyStringToNull(numberToString(bill.amount));
  emit('open');
});

function onSave() {
  bill.day_due_on = emptyStringToNull(bill.day_due_on);
  store.dispatch('editBill', bill);
  emit('close');
}

function onDelete() {
  eventBus.emit('delete-bill', bill);
  emit('close');
}
</script>
