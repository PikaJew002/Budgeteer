<template>
  <div id="make-paycheck">
    <b-alert :show="message.countDown"
             dismissible
             :variant="message.type"
             fade
             @dismissed="message.countDown=0"
             @dismiss-count-down="countDownChanged">
      {{message.message}}
    </b-alert>
    <b-modal v-model="showModal" ref="make-paycheck-modal" id="make-paycheck-modal" title="Make Paycheck" centered no-close-on-backdrop>
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
            <div v-if="!$v.paycheck.amount.required || !$v.paycheck.amount_project.required" class="invalid-feedback d-block">
              Amount is required
            </div>
            <div v-if="!$v.paycheck.amount.validDecimal || !$v.paycheck.amount_project.validDecimal" class="invalid-feedback d-block">
              Amount must be a valid decimal ($xxxx.xx)
            </div>
            <div v-if="($v.paycheck.amount.validDecimal && !$v.paycheck.amount.notZero) || ($v.paycheck.amount_project.validDecimal && !$v.paycheck.amount_project.notZero)" class="invalid-feedback d-block">
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
          <div v-if="!$v.paycheck.paid_on.required" class="invalid-feedback">
            Paid On is required (valid date)
          </div>
        </div>
      </form>
      <template slot="modal-footer">
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
  import { numberToString, emptyStringToNull } from '../../utils/main.js';
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
      EventBus.$on('make-paycheck', arr => {
        this.paycheck.income_id = arr[0];
        this.paycheck.amount_project = null;
        this.paycheck.amount = null;
        this.paycheck.notify_when_paid = false;
        this.paycheck.paid_on = arr[1];
        this.projected = false;
        this.showModal = true;
      });
    },
    methods: {
      onSave(paycheck) {
        if(!this.$v.paycheck.$invalid) {
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
          'is-invalid': this.$v[obj][attr].$invalid && !this.$v[obj][attr].$pending,
          'is-valid': !this.$v[obj][attr].$invalid && !this.$v[obj][attr].$pending,
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
      incomes() {
        return this.$store.getters.getIncomes;
      },
    },
  };
</script>
