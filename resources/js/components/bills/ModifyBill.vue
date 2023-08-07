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
                 :class="validationClasses(v$, 'bill', 'name')">
          <div v-if="!v$.bill.name.required" class="invalid-feedback">
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
                     @blur="bill.amount = formatAmount(bill.amount)"
                     :class="validationClasses(v$, 'bill', 'amount')">
            </div>
            <div v-if="!v$.bill.amount.required" class="invalid-feedback">
              Amount is required
            </div>
            <div v-if="!v$.bill.amount.validDecimal" class="invalid-feedback d-block">
              Amount must be a valid decimal ($xxxx.xx)
            </div>
            <div v-if="v$.bill.amount.validDecimal && !v$.bill.amount.notZero" class="invalid-feedback d-block">
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
                   :class="validationClasses(v$, 'bill', 'day_due_on')">
            <div v-if="!v$.bill.day_due_on.integer || !v$.bill.day_due_on.minValue || !v$.bill.day_due_on.maxValue" class="invalid-feedback">
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
                   :class="validationClasses(v$, 'bill', 'start_on')">
            <div v-if="!v$.bill.start_on.required" class="invalid-feedback">
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
                   :class="validationClasses(v$, 'bill', 'end_on')">
            <div v-if="!v$.bill.end_on.required" class="invalid-feedback">
              End On is required (valid date)
            </div>
            <div v-if="!v$.bill.end_on.minDate" class="invalid-feedback">
              End On Date must be after the Start On Date
            </div>
          </div>
        </div>
      </form>
      <template v-slot:modal-footer>
        <button class="btn btn-danger btn-sm" @click="onDelete(bill)">
          Delete
        </button>
        <button class="btn btn-sub1 btn-sm" @click="$emit('close')">
          Cancel
        </button>
        <button class="btn btn-base btn-sm" @click="onSave(bill)">
          Save
        </button>
      </template>
    </Modal>
  </div>
</template>

<script>
import { useVuelidate } from '@vuelidate/core';
import { helpers, required, minValue, maxValue, integer } from '@vuelidate/validators';
import moment from 'moment';
import Alert from '../Alert.vue';
import Modal from '../Modal.vue';
import { emptyStringToNull, numberToString, copyObjectProperties } from '../../utils/main.js';
import { notZero, validationInputClasses } from '../../utils/validation.js';
const validDecimal = helpers.regex(/^\d{0,4}(\.\d{0,2})?$/);
export default {
  components: {
    Alert,
    Modal,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['open', 'close'],
  setup() {
    return { v$: useVuelidate() }
  },
  data() {
    return {
      bill: {
        id: null,
        name: "",
        amount: null,
        day_due_on: null,
        start_on: "",
        end_on: "",
        created_at: "",
        updated_at: "",
      },
    };
  },
  validations() {
    return {
      bill: {
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
          minDate: (end_on) => (end_on == "" || moment(end_on).isAfter(this.bill.start_on)),
        },
      },
    };
  },
  created() {
    this.$eventBus.on('modify-bill', (bill) => {
      copyObjectProperties(bill, this.bill);
      this.bill.amount = emptyStringToNull(numberToString(bill.amount));
      this.$emit('open');
    });
  },
  methods: {
    onSave(bill) {
      this.bill.day_due_on = emptyStringToNull(this.bill.day_due_on);
      this.$store.dispatch('editBill', bill);
      this.$emit('close');
    },
    onDelete(bill) {
      this.$eventBus.emit('delete-bill', bill);
      this.$emit('close');
    },
    formatAmount(amount) {
      return numberToString(amount);
    },
    /* @TODO extract (along with input) into amount-input component */
    validationClasses(v$, obj, attr) {
      return validationInputClasses(v$, obj, attr);
    },
  },
}
</script>
