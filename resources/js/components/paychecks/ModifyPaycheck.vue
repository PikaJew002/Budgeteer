<template>
  <div id="modify-paycheck">
    <b-alert :show="message.countDown"
             dismissible
             :variant="message.type"
             fade
             @dismissed="message.countDown=0"
             @dismiss-count-down="countDownChanged">
      {{message.message}}
    </b-alert>
    <b-modal v-model="showModal" ref="modify-paycheck-modal" id="modify-paycheck-modal" title="Edit Paycheck" centered no-close-on-backdrop>
      <form @submit.prevent="onSave(paycheck)">
        <div class="form-group">
          <label for="income_id">Income: </label>
          <select
            v-model.number="paycheck.income_id"
            id="income_id"
            disabled
            class="custom-select"
            :class="validationClasses($v, 'paycheck', 'income_id')"
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
                @blur="paycheck.amount_project = formatAmount(paycheck.amount_project)"
                id="amount"
                type="text"
                placeholder="Amount"
                class="form-control"
                :class="validationClasses($v, 'paycheck', 'amount_project')"
              >
              <input
                v-else
                v-model="paycheck.amount"
                @blur="paycheck.amount = formatAmount(paycheck.amount)"
                id="amount"
                type="text"
                placeholder="Amount"
                class="form-control"
                :class="validationClasses($v, 'paycheck', 'amount')"
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
            <div v-if="!$v.paycheck.amount.required || !$v.paycheck.amount_project.required" class="invalid-feedback d-block">
              Amount is required
            </div>
            <div v-if="!$v.paycheck.amount.validDecimal || !$v.paycheck.amount_project.validDecimal" class="invalid-feedback d-block">
              Amount must be a valid decimal ($xxxx.xx)
            </div>
            <div v-if="($v.paycheck.amount.validDecimal && !$v.paycheck.amount.notZero) || ($v.paycheck.amount_project.validDecimal && !$v.paycheck.amount_project.notZero)" class="invalid-feedback d-block">
              Amount must be greater than zero (0.00)
            </div>
          </div>
        </div>
        <div class="row">
          <div v-if="this.paycheck.notified_at == null || isNotifiable" class="col form-group">
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
          <div class="col" v-if="this.paycheck.notified_at != null">
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
                 :class="validationClasses($v, 'paycheck', 'paid_on')">
          <div v-if="!$v.paycheck.paid_on.required" class="invalid-feedback">
            Paid On is required (valid date)
          </div>
        </div>
      </form>
      <template slot="modal-footer">
        <b-button size="sm" variant="danger" @click="onDelete(paycheck)">
          Delete
        </b-button>
        <b-button size="sm" variant="sub1" @click="$emit('close')">
          Cancel
        </b-button>
        <b-button size="sm" variant="base" @click="onSave(paycheck)">
          Save
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
  import { BModal, BAlert, BButton } from 'bootstrap-vue';
  import { helpers, required, requiredIf, minValue } from 'vuelidate/lib/validators';
  import moment from 'moment';
  import Alert from '../../api/alert.js';
  import { EventBus } from '../../event-bus.js';
  import { emptyStringToNull, numberToString, copyObjectProperties } from '../../utils/main.js';
  import { notZero, validationInputClasses } from '../../utils/validation.js';
  const validDecimal = helpers.regex('validDecimal', /^\d{0,4}(\.\d{0,2})?$/);
  export default {
    components: {
      'b-modal': BModal,
      'b-alert': BAlert,
      'b-button': BButton,
    },
    props: {
      user: {
        type: Object,
      },
      show: {
        type: Boolean,
        required: true,
      },
    },
    mixins: [Alert],
    data() {
      return {
        projected: false,
        paycheck: {
          id: null,
          income_id: null,
          amount_project: null,
          amount: null,
          notified_at: null,
          notify_when_paid: false,
          paid_on: null,
          created_at: "",
          updated_at: "",
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
            notZero,
          },
          amount: {
            required: requiredIf(function() {
              return !this.paycheck.amount_project;
            }),
            validDecimal,
            notZero,
          },
          paid_on: {
            required,
          },
        },
      };
    },
    created() {
      EventBus.$on('modify-paycheck', (paycheck) => {
        copyObjectProperties(paycheck, this.paycheck);
        if(paycheck.amount == null) {
          this.projected = true;
          this.paycheck.amount_project = this.formatAmount(paycheck.amount_project);
        } else {
          this.projected = false;
          this.paycheck.amount = this.formatAmount(paycheck.amount);
        }
        this.showModal = true;
      });
    },
    methods: {
      onSave(paycheck) {
        if(!this.$v.paycheck.$invalid) {
          this.$store.dispatch('editPaycheck', paycheck);
          this.$emit('close');
        }
      },
      onDelete(paycheck) {
        EventBus.$emit('delete-paycheck', paycheck);
        this.$emit('close');
      },
      formatAmount(amount) {
        return numberToString(amount);
      },
      /* @TODO extract (along with input) into amount-input component */
      validationClasses(v$, obj, attr) {
        return validationInputClasses(v$, obj, attr);
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
      showModal: {
        get() {
          return this.show;
        },
        set(value) {
          if(value) {
            this.$emit('open');
          } else {
            this.$emit('close');
          }
        }
      },
      isNotifiable() {
        return this.paycheck.paid_on && moment().isSameOrBefore(this.paycheck.paid_on, 'day');
      },
      /**
        Gets the incomes
        */
      incomes() {
        return this.$store.getters.getIncomes;
      },
    },
  };
</script>
