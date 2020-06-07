<template>
  <div id="make-bill">
    <b-alert :show="message.countDown"
             dismissible
             :variant="message.type"
             fade
             @dismissed="message.countDown=0"
             @dismiss-count-down="countDownChanged">
      {{message.message}}
    </b-alert>
    <b-modal v-model="showModal" ref="make-bill-modal" id="make-bill-modal" title="Make Bill" centered no-close-on-backdrop>
      <form @submit.prevent="onSave(bill)">
        <div class="form-group">
          <label for="name">Name: </label>
          <input class="form-control"
                  :class="{ 'is-invalid': $v.bill.name.$invalid && !$v.bill.name.$pending,
                            'is-valid': !$v.bill.name.$invalid && !$v.bill.name.$pending }"
                  id="name"
                  type="text"
                  placeholder="Name"
                  v-model="bill.name">
          <div v-if="!$v.bill.name.required" class="invalid-feedback">
            Name is required
          </div>
          <div v-if="!$v.bill.name.minLength" class="invalid-feedback">
            Name must be at least 2 characters
          </div>
          <div v-if="!$v.bill.name.maxLength" class="invalid-feedback">
            Name cannot be more than 50 characters
          </div>
        </div>
        <div class="row">
          <div class="col form-group">
            <label for="amount">Amount: </label>
            <div class="input-group">
              <div class="input-group-prepend">
                <div class="input-group-text">$</div>
              </div>
              <input class="form-control" id="amount" type="text" placeholder="Amount"
                     v-model="bill.amount" @blur="formatAmount()"
                      :class="{ 'is-invalid': $v.bill.amount.$invalid && !$v.bill.amount.$pending,
                                'is-valid': !$v.bill.amount.$invalid && !$v.bill.amount.$pending }">
            </div>
            <div v-if="!$v.bill.amount.required" class="invalid-feedback d-block">
              Amount is required
            </div>
            <div v-if="!$v.bill.amount.validDecimal" class="invalid-feedback d-block">
              Amount must be a valid decimal ($xxxx.xx)
            </div>
          </div>
          <div class="col form-group">
            <label for="day_due_on">Day Due: </label>
            <input class="form-control"
                    :class="{ 'is-invalid': $v.bill.day_due_on.$invalid && !$v.bill.day_due_on.$pending,
                              'is-valid': !$v.bill.day_due_on.$invalid && !$v.bill.day_due_on.$pending }"
                    id="day_due_on"
                    type="number"
                    placeholder="Day Due"
                    v-model.number="bill.day_due_on">
            <div v-if="!$v.bill.day_due_on.integer || !$v.bill.day_due_on.minValue || !$v.bill.day_due_on.maxValue" class="invalid-feedback">
              Amount must be a valid integer day (1-31)
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col form-group">
            <label for="start_on">Start On Date: </label>
            <input class="form-control"
                    :class="{ 'is-invalid': $v.bill.start_on.$invalid && !$v.bill.start_on.$pending,
                              'is-valid': !$v.bill.start_on.$invalid && !$v.bill.start_on.$pending }"
                    id="start_on"
                    type="date"
                    placeholder="mm/dd/yyyy"
                    v-model="bill.start_on">
            <div v-if="!$v.bill.start_on.required" class="invalid-feedback">
              Start On Date is required
            </div>
          </div>
          <div class="col form-group">
            <label for="end_on">End On Date: </label>
            <input class="form-control"
                    :class="{ 'is-invalid': $v.bill.end_on.$invalid && !$v.bill.end_on.$pending,
                              'is-valid': !$v.bill.end_on.$invalid && !$v.bill.end_on.$pending }"
                    id="end_on"
                    type="date"
                    placeholder="mm/dd/yyyy"
                    v-model="bill.end_on">
            <div v-if="!$v.bill.end_on.required" class="invalid-feedback">
              End On Date is required
            </div>
            <div v-if="!$v.bill.end_on.minDate" class="invalid-feedback">
              End On Date must be after the Start On Date
            </div>
          </div>
        </div>
      </form>
      <template slot="modal-footer">
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
  import { helpers, required, minValue, maxValue, integer, minLength, maxLength } from 'vuelidate/lib/validators';
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
        bill: {
          name: "",
          amount: "",
          day_due_on: null,
          start_on: "",
          end_on: ""
          start_on: null,
        },
      };
    },
    validations() {
      return {
        bill: {
          name: {
            required,
            minLength: minLength(2),
            maxLength: maxLength(50),
          },
          amount: {
            required,
            validDecimal,
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
      EventBus.$on('make-bill', start_on => {
        this.bill.name = "";
        this.bill.amount = null;
        this.bill.day_due_on = null;
        this.bill.start_on = start_on;
        this.bill.end_on = "";
        this.showModal = true;
      });
    },
    methods: {
      onSave(bill) {
        if(!this.$v.bill.$invalid) {
          this.$store.dispatch('addBill', bill);
          this.$emit('close');
        }
      },
      formatAmount() {
        if(Number(this.bill.amount).toFixed(2) != "NaN") {
          this.bill.amount = Number(this.bill.amount).toFixed(2);
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
    },
  };
</script>
