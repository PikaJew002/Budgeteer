<template>
  <div id="make-paycheck">
    <Modal :show="show" @hide="$emit('close')" id="make-paycheck-modal" title="Make Paycheck">
      <form @submit.prevent="onSave(paycheck)">
        <div class="form-group">
          <label for="income_id">Income: </label>
          <select class="custom-select"
                  id="income_id"
                  v-model.number="paycheck.income_id"
                  :class="validationClasses('paycheck', 'income_id')">
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
                     @blur="paycheck.amount_project = formatAmount(paycheck.amount_project)"
                     :class="validationClasses('paycheck', 'amount_project')">
              <input v-else
                     class="form-control"
                     id="amount"
                     type="text"
                     placeholder="Amount"
                     v-model="paycheck.amount"
                     @blur="paycheck.amount = formatAmount(paycheck.amount)"
                     :class="validationClasses('paycheck', 'amount')">
            </div>
            <div class="custom-control custom-checkbox">
              <input class="custom-control-input"
                     id="projected"
                     type="checkbox"
                     v-model="projected"
                     @change="onCheckProjected()">
              <label class="custom-control-label" for="projected">Projected?</label>
            </div>
            <div v-if="!v$.paycheck.amount.required || !v$.paycheck.amount_project.required" class="invalid-feedback d-block">
              Amount is required
            </div>
            <div v-if="!v$.paycheck.amount.validDecimal || !v$.paycheck.amount_project.validDecimal" class="invalid-feedback d-block">
              Amount must be a valid decimal ($xxxx.xx)
            </div>
            <div v-if="(v$.paycheck.amount.validDecimal && !v$.paycheck.amount.notZero) || (v$.paycheck.amount_project.validDecimal && !v$.paycheck.amount_project.notZero)" class="invalid-feedback d-block">
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
                 :class="validationClasses('paycheck', 'paid_on')">
          <div v-if="!v$.paycheck.paid_on.required" class="invalid-feedback">
            Paid On is required (valid date)
          </div>
        </div>
      </form>
      <template v-slot:modal-footer>
        <button class="btn btn-sub1 btn-sm" @click="$emit('close')">
          Cancel
        </button>
        <button class="btn btn-base btn-sm" @click="onSave(paycheck)">
          Save
        </button>
      </template>
    </Modal>
  </div>
</template>

<script>
import { useVuelidate } from '@vuelidate/core';
import { helpers, required, requiredIf, minValue } from '@vuelidate/validators';
import moment from 'moment';
import Modal from '../Modal.vue';
import { numberToString, emptyStringToNull } from '../../utils/main.js';
const validDecimal = helpers.regex(/^\d{0,4}(\.\d{0,2})?$/);
export default {
  components: {
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
      projected: false,
      paycheck: {
        income_id: null,
        amount_project: null,
        amount: null,
        notify_when_paid: false,
        paid_on: "",
      },
    };
  },
  validations() {
    return {
      paycheck: {
        income_id: {
          required,
          minValue: minValue(1),
        },
        amount_project: {
          required: requiredIf(function() {
            return !this.paycheck.amount;
          }),
          validDecimal,
          notZero: (amount_project) => ((amount_project == "" || amount_project == null) || (Number(amount_project) > 0)),
        },
        amount: {
          required: requiredIf(function() {
            return !this.paycheck.amount_project;
          }),
          validDecimal,
          notZero: (amount) => ((amount == "" || amount == null) || (Number(amount) > 0)),
        },
        paid_on: {
          required,
        },
      },
    };
  },
  created() {
    this.$eventBus.on('make-paycheck', (paid_on) => {
      this.paycheck.income_id = 0;
      this.paycheck.amount_project = null;
      this.paycheck.amount = null;
      this.paycheck.notify_when_paid = false;
      this.paycheck.paid_on = paid_on;
      this.projected = false;
      this.$emit('open');
    });
  },
  methods: {
    onSave(paycheck) {
      if(!this.v$.paycheck.$invalid) {
        this.paycheck.amount = emptyStringToNull(this.paycheck.amount);
        this.paycheck.amount_project = emptyStringToNull(this.paycheck.amount_project);
        this.$store.dispatch('addPaycheck', paycheck);
        this.$emit('close');
      }
    },
    formatAmount(amount) {
      return numberToString(amount);
    },
    /* @TODO extract (along with input) into amount-input component */
    validationClasses(obj, attr) {
      return {
        'is-invalid': this.v$[obj][attr].$invalid && !this.v$[obj][attr].$pending,
        'is-valid': !this.v$[obj][attr].$invalid && !this.v$[obj][attr].$pending,
      };
    },
    onCheckProjected() {
      if(this.projected) {
        this.paycheck.amount_project = this.paycheck.amount;
        this.paycheck.amount = null;
      } else {
        this.paycheck.amount = this.paycheck.amount_project;
        this.paycheck.amount_project = null;
      }
    },
    onPaidOnChange() {
      if(this.paycheck.notify_when_paid && !this.isNotifiable) {
        this.paycheck.notify_when_paid = false;
      }
    },
  },
  computed: {
    isNotifiable() {
      return this.paycheck.paid_on && moment().isSameOrBefore(this.paycheck.paid_on, 'day');
    },
    incomes() {
      return this.$store.getters.getIncomes;
    },
  },
}
</script>
