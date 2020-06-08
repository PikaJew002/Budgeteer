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
                  :class="{ 'is-invalid': $v.paycheck.income_id.$invalid && !$v.paycheck.income_id.$pending,
                            'is-valid': !$v.paycheck.income_id.$invalid && !$v.paycheck.income_id.$pending }"
                  v-model.number="paycheck.income_id"
                  id="income_id">
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
              <input v-if="projected" type="text" class="form-control" id="amount" placeholder="Amount"
                     v-model="paycheck.amount_project" @blur="formatAmountProject()"
                     :class="{ 'is-invalid': $v.paycheck.amount_project.$invalid && !$v.paycheck.amount_project.$pending,
                               'is-valid': !$v.paycheck.amount_project.$invalid && !$v.paycheck.amount_project.$pending }">
              <input v-else type="text" class="form-control" id="amount" placeholder="Amount"
                     v-model="paycheck.amount" @blur="formatAmount()"
                     :class="{ 'is-invalid': $v.paycheck.amount.$invalid && !$v.paycheck.amount.$pending,
                               'is-valid': !$v.paycheck.amount.$invalid && !$v.paycheck.amount.$pending }">
            </div>
            <div class="custom-control custom-checkbox">
              <input type="checkbox" class="custom-control-input" id="projected" v-model="projected" @change="onCheckProjected()">
              <label class="custom-control-label" for="projected">Projected?</label>
            </div>
            <div v-if="!$v.paycheck.amount.required || !$v.paycheck.amount_project.required" class="invalid-feedback d-block">
              Amount is required
            </div>
            <div v-if="!$v.paycheck.amount.validDecimal || !$v.paycheck.amount_project.validDecimal" class="invalid-feedback d-block">
              Amount must be a valid decimal ($xxxx.xx)
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col form-group">
            <div class="custom-control custom-checkbox">
              <input type="checkbox" class="custom-control-input" id="notify" v-model="paycheck.notify_when_paid" :disabled="!isNotifiable">
              <label class="custom-control-label" for="notify">Notify when paid?</label>
            </div>
            <span v-if="isNotifiable">You'll receive an email</span>
            <span v-else class="text-muted">You can't recieve a notification from the past...</span>
          </div>
        </div>
        <div class="form-group">
          <label for="paid_on">Paid On: </label>
          <input class="form-control"
                  :class="{ 'is-invalid': $v.paycheck.paid_on.$invalid && !$v.paycheck.paid_on.$pending,
                            'is-valid': !$v.paycheck.paid_on.$invalid && !$v.paycheck.paid_on.$pending }"
                  id="paid_on"
                  type="date"
                  placeholder="mm/dd/yyyy"
                  v-model.date="paycheck.paid_on"
                  @change="onPaidOnChange()">
          <div v-if="!$v.paycheck.paid_on.required" class="invalid-feedback">
            A valid date is required
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
          paid_on: null,
        },
      };
    },
    validations: {
      paycheck: {
        income_id: {
          required,
          minValue: minValue(1)
        },
        amount_project: {
          required: requiredIf(function() {
            return !this.paycheck.amount;
          }),
          validDecimal
        },
        amount: {
          required: requiredIf(function() {
            return !this.paycheck.amount_project;
          }),
          validDecimal
        },
        paid_on: {
          required
        }
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
          if(this.paycheck.amount == "") {
            this.paycheck.amount = null;
          }
          if(this.paycheck.amount_project == "") {
            this.paycheck.amount_project = null;
          }
          this.$store.dispatch('addPaycheck', paycheck);
          this.$emit('close');
        }
      },
      formatAmount() {
        if(Number(this.paycheck.amount).toFixed(2) != "NaN") {
          this.paycheck.amount = Number(this.paycheck.amount).toFixed(2);
        }
      },
      formatAmountProject() {
        if(Number(this.paycheck.amount_project).toFixed(2) != "NaN") {
          this.paycheck.amount_project = Number(this.paycheck.amount_project).toFixed(2);
        }
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
      /**
        Gets the incomes load status
        */
      incomesLoadStatus() {
        return this.$store.getters.getIncomesLoadStatus;
      }
    },
  };
</script>
