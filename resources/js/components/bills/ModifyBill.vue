<template>
  <div id="modify-bill">
    <b-alert :show="message.countDown"
             dismissible
             :variant="message.type"
             fade
             @dismissed="message.countDown=0"
             @dismiss-count-down="countDownChanged">
      {{message.message}}
    </b-alert>
    <b-modal v-model="showModal" ref="modify-bill-modal" id="modify-bill-modal" title="Edit Bill" centered no-close-on-backdrop>
      <form @submit.prevent="onSave(bill)">
        <div class="form-group">
          <label for="name">Name: </label>
          <input class="form-control"
                 id="name"
                 type="text"
                 placeholder="Name"
                 v-model="bill.name"
                 :class="validationClasses($v, 'bill', 'name')">
          <div v-if="!$v.bill.name.required" class="invalid-feedback">
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
                     :class="validationClasses($v, 'bill', 'amount')">
            </div>
            <div v-if="!$v.bill.amount.required" class="invalid-feedback">
              Amount is required
            </div>
            <div v-if="!$v.bill.amount.validDecimal" class="invalid-feedback d-block">
              Amount must be a valid decimal ($xxxx.xx)
            </div>
            <div v-if="$v.bill.amount.validDecimal && !$v.bill.amount.notZero" class="invalid-feedback d-block">
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
                   :class="validationClasses($v, 'bill', 'day_due_on')">
            <div v-if="!$v.bill.day_due_on.integer || !$v.bill.day_due_on.minValue || !$v.bill.day_due_on.maxValue" class="invalid-feedback">
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
                   :class="validationClasses($v, 'bill', 'start_on')">
            <div v-if="!$v.bill.start_on.required" class="invalid-feedback">
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
                   :class="validationClasses($v, 'bill', 'end_on')">
            <div v-if="!$v.bill.end_on.required" class="invalid-feedback">
              End On is required (valid date)
            </div>
            <div v-if="!$v.bill.end_on.minDate" class="invalid-feedback">
              End On Date must be after the Start On Date
            </div>
          </div>
        </div>
      </form>
      <template slot="modal-footer">
        <b-button size="sm" variant="danger" @click="onDelete(bill)">
          Delete
        </b-button>
        <b-button size="sm" variant="sub1" @click="$emit('close')">
          Cancel
        </b-button>
        <b-button size="sm" variant="base" @click="onSave(bill)">
          Save
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
  import { BModal, BAlert, BButton } from 'bootstrap-vue';
  import { helpers, required, minValue, maxValue, integer } from 'vuelidate/lib/validators';
  import { cloneDeep } from 'lodash';
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
      EventBus.$on('modify-bill', (bill) => {
        copyObjectProperties(bill, this.bill);
        this.bill.amount = emptyStringToNull(numberToString(bill.amount));
        this.showModal = true;
      });
    },
    methods: {
      onSave(bill) {
        this.bill.day_due_on = emptyStringToNull(this.bill.day_due_on);
        this.$store.dispatch('editBill', bill);
        this.$emit('close');
      },
      onDelete(bill) {
        EventBus.$emit('delete-bill', bill);
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
    }
  };
</script>
