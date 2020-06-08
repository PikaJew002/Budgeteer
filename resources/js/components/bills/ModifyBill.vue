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
                  :class="{ 'is-invalid': $v.bill.name.$invalid && !$v.bill.name.$pending,
                            'is-valid': !$v.bill.name.$invalid && !$v.bill.name.$pending }"
                  id="name"
                  type="text"
                  placeholder="Name"
                  v-model="bill.name">
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
                      :class="{ 'is-invalid': $v.bill.amount.$invalid && !$v.bill.amount.$pending,
                                'is-valid': !$v.bill.amount.$invalid && !$v.bill.amount.$pending }"
                      id="amount"
                      type="text"
                      placeholder="Amount"
                      v-model="bill.amount">
            </div>
            <div v-if="!$v.bill.amount.required" class="invalid-feedback">
              Amount is required
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
  import { required, minValue, maxValue, integer } from 'vuelidate/lib/validators';
  import { cloneDeep } from 'lodash';
  import Alert from '../../api/alert.js';
  import { EventBus } from '../../event-bus.js';
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
          start_on: null,
          end_on: null,
        },
      };
    },
    validations: {
      bill: {
        name: {
          required
        },
        amount: {
          required
        },
        day_due_on: {
          integer,
          minValue: minValue(1),
          maxValue: maxValue(31)
        },
        start_on: {
          required
        },
        end_on: {
          required
        }
      }
    },
    created() {
      EventBus.$on('modify-bill', obj => {
        this.bill.id = obj.id;
        this.bill.name = obj.name;
        this.bill.amount = obj.amount;
        this.bill.day_due_on = obj.day_due_on;
        this.bill.start_on = obj.start_on;
        this.bill.end_on = obj.end_on;
        this.showModal = true;
      });
    },
    methods: {
      onSave(bill) {
        if(this.bill.day_due_on == "") {
          this.bill.day_due_on = null;
        }
        this.$store.dispatch('editBill', bill);
        this.$emit('close');
      },
      onDelete(bill) {
        EventBus.$emit('delete-bill', bill);
        this.$emit('close');
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
