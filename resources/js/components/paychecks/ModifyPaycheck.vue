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
          <div class="col form-group" v-if="this.paycheck.notified_at == null || isNotifiable">
            <div class="custom-control custom-checkbox">
              <input type="checkbox" class="custom-control-input" id="notify" v-model="paycheck.notify_when_paid" :disabled="!isNotifiable">
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
  const validDecimal = helpers.regex('validDecimal', /^\d{0,4}(\.\d{0,2})?$/);
  export default {
    components: {
      'b-modal': BModal,
      'b-alert': BAlert,
      'b-button': BButton
    },
    props: {
      user: {
        type: Object
      },
      show: {
        type: Boolean,
        required: true
      }
    },
    mixins: [Alert],
    data() {
      return {
        projected: false,
        paycheck: {
          id: 0,
          income_id: 0,
          amount_project: null,
          amount: null,
          notified_at: null,
          notify_when_paid: false,
          paid_on: ""
        }
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
      }
    },
    created() {
      EventBus.$on('modify-paycheck', obj => {
        this.paycheck.id = obj.id;
        this.paycheck.income_id = obj.income_id;
        if(obj.amount == null) {
          this.paycheck.amount_project = ""+obj.amount_project;
          this.paycheck.amount = null;
          this.projected = true;
        } else {
          this.paycheck.amount = ""+obj.amount;
          this.paycheck.amount_project = null;
          this.projected = false;
        }
        this.paycheck.notified_at = obj.notified_at;
        this.paycheck.notify_when_paid = obj.notify_when_paid;
        this.paycheck.paid_on = obj.paid_on;
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
      }
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
    }
  };
</script>
