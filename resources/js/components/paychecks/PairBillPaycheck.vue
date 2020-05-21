<template>
  <div id="pair-paycheck">
    <b-alert :show="message.countDown"
             dismissible
             :variant="message.type"
             fade
             @dismissed="message.countDown=0"
             @dismiss-count-down="countDownChanged">
      {{message.message}}
    </b-alert>
    <b-alert dismissible
            fade
            v-model="showPairAlert"
            variant="success"
            @dismissed="onDismissAlert()">
      Select a {{ type == "paycheck" ? "bill" : "paycheck" }} to pair with this {{ type }}
    </b-alert>
    <b-modal v-model="showModal"
             ref="pair-paycheck-modal"
             id="pair-paycheck-modal"
             centered
             no-close-on-backdrop
             @hidden="onHideModal()">
      <template slot="modal-header">
        <h5>{{ (isUpdate ? 'Update' : 'Pair') }} Bill-Paycheck</h5>
        <button type="button" class="close" aria-label="Close" @click="onClose()">
          <span aria-hidden="true">&times;</span>
        </button>
      </template>
      <form @submit.prevent="onSave()" v-if="paycheck != null && bill != null">
        <div class="row">
          <div class="col">
            <h5>Paycheck ${{ paycheck.amount == null ? paycheck.amount_project : paycheck.amount }}</h5>
            <small class="text-muted mb-0">Paid on: {{ paycheck_paid_on }}</small>
          </div>
          <div class="col form-group">
            <h5>{{ bill.name }}</h5>
            <label class="sr-only" for="amount">Amount</label>
            <div class="input-group">
              <div class="input-group-prepend">
                <div class="input-group-text">$</div>
              </div>
              <input v-if="projected" type="text" class="form-control" id="amount" placeholder="Amount"
                     v-model="pair.amount_project" @blur="formatAmountProject()"
                     :class="{ 'is-invalid': $v.pair.amount_project.$invalid && !$v.pair.amount_project.$pending,
                               'is-valid': !$v.pair.amount_project.$invalid && !$v.pair.amount_project.$pending }">
              <input v-else type="text" class="form-control" id="amount" placeholder="Amount"
                     v-model="pair.amount" @blur="formatAmount()"
                     :class="{ 'is-invalid': $v.pair.amount.$invalid && !$v.pair.amount.$pending,
                               'is-valid': !$v.pair.amount.$invalid && !$v.pair.amount.$pending }">
            </div>
            <div class="custom-control custom-checkbox">
              <input type="checkbox" class="custom-control-input" id="projected" v-model="projected" @change="onCheck()">
              <label class="custom-control-label" for="projected">Projected?</label>
            </div>
            <div v-if="!$v.pair.amount.required || !$v.pair.amount_project.required" class="invalid-feedback d-block">
              Amount is required
            </div>
            <div v-if="!$v.pair.amount.validDecimal || !$v.pair.amount_project.validDecimal" class="invalid-feedback d-block">
              Amount must be a valid decimal ($xxxx.xx)
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col form-group">
            <label for="due_on">Due on: </label>
            <input type="date" class="form-control" id="due_on" v-model="pair.due_on"
                   :class="{ 'is-invalid': $v.pair.due_on.$invalid && !$v.pair.due_on.$pending,
                             'is-valid': !$v.pair.due_on.$invalid && !$v.pair.due_on.$pending }">
            <div v-if="!$v.pair.due_on.required" class="invalid-feedback">
              Due On is required
            </div>
          </div>
          <div class="col form-group">
            <label for="paid_on">Paid on: </label>
            <input type="date" class="form-control" id="paid_on" v-model="pair.paid_on"
                   :class="{ 'is-invalid': !isNullOrEmpty($v.pair.paid_on.$model) && $v.pair.paid_on.$invalid && !$v.pair.paid_on.$pending,
                             'is-valid': !isNullOrEmpty($v.pair.paid_on.$model) && !$v.pair.paid_on.$invalid && !$v.pair.paid_on.$pending }">
            <div v-if="!$v.pair.paid_on.maxValue" class="invalid-feedback">
              Paid On must be before or on the date due
            </div>
          </div>
        </div>
      </form>
      <template slot="modal-footer">
        <b-button v-if="isUpdate" size="sm" variant="danger" @click="onDeletePair()">
          Delete
        </b-button>
        <b-button size="sm" variant="sub1" @click="onClose()">
          Cancel
        </b-button>
        <b-button size="sm" variant="base" @click="onSave()">
          Save
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
  import { BAlert, BButton, BModal } from 'bootstrap-vue';
  import { helpers, required, requiredIf, maxValue } from 'vuelidate/lib/validators';
  import moment from 'moment';
  import Alert from '../../api/alert.js';
  import { EventBus } from '../../event-bus.js';
  const validDecimal = helpers.regex('validDecimal', /^\d{0,4}(\.\d{0,2})?$/);
  export default {
    components: {
      'b-alert': BAlert,
      'b-button': BButton,
      'b-modal': BModal
    },
    mixins: [Alert],
    created() {
      EventBus.$on('paycheck-pair-start', obj => {
        this.paycheck = obj;
        this.pair.paycheck_id = obj.id;
        this.type = "paycheck";
        this.showPairAlert = true;
      });
      EventBus.$on('bill-pair-start', arr => {
        this.type = "bill";
        this.bill = arr[0];
        this.month = arr[1];
        this.pair.bill_id = this.bill.id;
        this.showPairAlert = true;
      });
      EventBus.$on('paycheck-pair-end', obj => {
        if(obj != null) {
          this.paycheck = obj;
          this.pair.paycheck_id = obj.id;
          this.pair.amount = "" + this.bill.amount;
          this.pair.due_on = "" + this.month[1] + "-" +
                            (this.month[0] > 9 ? this.month[0] : "0" + this.month[0]) + "-" +
                            (this.bill.day_due_on > 9 ? this.bill.day_due_on : "0" + this.bill.day_due_on);
          this.showPairAlert = false;
        } else {
          this.showPairAlert = false;
          this.onHideModal();
        }
      });
      EventBus.$on('bill-pair-end', arr => {
        if(arr != null) {
          this.bill = arr[0];
          this.month = arr[1];
          this.pair.bill_id = this.bill.id;
          this.pair.amount = "" + this.bill.amount;
          this.pair.due_on = "" + this.month[1] + "-" +
                            (this.month[0] > 9 ? this.month[0] : "0" + this.month[0]) + "-"+
                            (this.bill.day_due_on > 9 ? this.bill.day_due_on : "0" + this.bill.day_due_on);
          this.showPairAlert = false;
        } else {
          this.showPairAlert = false;
          this.onHideModal();
        }
      });
      EventBus.$on('pair-update', arr => {
        this.isUpdate = true;
        this.bill = arr[0];
        this.paycheck = arr[1];
        this.pivotIn = arr[2];
        this.pair.bill_id = this.bill.id;
        this.pair.paycheck_id = this.paycheck.id;
        this.pair.paid_on = this[this.pivotIn].pivot_paid_on;
        this.pair.due_on = this[this.pivotIn].pivot_due_on;
        if(this[this.pivotIn].pivot_amount == null) {
          this.projected = true;
          this.pair.amount_project = ""+this[this.pivotIn].pivot_amount_project;
        } else {
          this.projected = false;
          this.pair.amount = ""+this[this.pivotIn].pivot_amount;
        }
        this.showModal = true;
      });
    },
    beforeDestroy() {
      EventBus.$off('paycheck-pair-start');
      EventBus.$off('bill-pair-start');
      EventBus.$off('paycheck-pair-end');
      EventBus.$off('bill-pair-end');
      EventBus.$off('pair-update');
    },
    data() {
      return {
        isUpdate: false,
        showPairAlert: false,
        showModal: false,
        type: "",
        bill: null,
        paycheck: null,
        projected: false,
        month: [],
        pivotIn: "",
        pair: {
          bill_id: null,
          paycheck_id: null,
          amount: null,
          amount_project: null,
          due_on: "",
          paid_on: ""
        }
      };
    },
    validations: {
      pair: {
        amount_project: {
          required: requiredIf(function() {
            return !this.pair.amount;
          }),
          validDecimal
        },
        amount: {
          required: requiredIf(function() {
            return !this.pair.amount_project;
          }),
          validDecimal
        },
        due_on: {
          required
        },
        paid_on: {
          maxValue
        }
      }
    },
    methods: {
      hasNoRelationship(bill, paycheck) {
        for(let i in bill.paychecks) {
          if(bill.paychecks[i].id == paycheck.id) {
            return false;
          }
        }
        return true;
      },
      onDismissAlert() {
        if(this.paycheck == null) {
          this.onHideModal();
          EventBus.$emit('paycheck-pair-end', null);
        } else if (this.bill == null) {
          this.onHideModal();
          EventBus.$emit('bill-pair-end', null);
        } else if(this.hasNoRelationship(this.bill, this.paycheck)) {
          this.formatAmount();
          this.showModal = true;
        } else {
          this.showAlert('warning', "The bill and paycheck selected are already paired.");
          this.onHideModal();
        }
      },
      onSave() {
        if(!this.$v.pair.$invalid) {
          if(this.isUpdate) {
            this.$store.dispatch('modifyBillPaycheck', {
              bill_paycheck: this.pair,
              bill: this.bill,
              paycheck: this.paycheck
            });
          } else {
            this.$store.dispatch('attachBillPaycheck', {
              bill_paycheck: this.pair,
              bill: this.bill,
              paycheck: this.paycheck,
            });
          }
          this.showModal = false;
          this.isUpdate = false;
        }
      },
      onClose() {
        this.showModal = false;
        this.isUpdate = false;
      },
      onDeletePair() {
        this.$store.dispatch('detachBillPaycheck', {
          bill_paycheck: this.pair,
          bill: this.bill,
          paycheck: this.paycheck,
        });
        this.showModal = false;
        this.isUpdate = false;
      },
      onHideModal() {
        this.bill = null;
        this.paycheck = null;
        this.pair.bill_id = null;
        this.pair.paycheck_id = null;
        this.pair.amount = null;
        this.pair.amount_project = null;
        this.pair.due_on = "";
        this.pair.paid_on = "";
      },
      formatAmount() {
        if(Number(this.pair.amount).toFixed(2) != "NaN") {
          this.pair.amount = Number(this.pair.amount).toFixed(2);
        }
      },
      formatAmountProject() {
        if(Number(this.pair.amount_project).toFixed(2) != "NaN") {
          this.pair.amount_project = Number(this.pair.amount_project).toFixed(2);
        }
      },
      isNullOrEmpty(value) {
        return value === null || value === ""
      },
      onCheck() {
        if(this.projected) {
          this.pair.amount_project = this.pair.amount;
          this.pair.amount = null;
        } else {
          this.pair.amount = this.pair.amount_project;
          this.pair.amount_project = null;
        }
      }
    },
    computed: {
      paycheckLeft() {
        if(this.paycheck == null) return 0;
        let total = (this.paycheck.amount == null ? this.paycheck.amount_project : this.paycheck.amount);
        for(let i in this.paycheck.bills) {
          total -= (this.paycheck.bills[i].pivot_amount ? this.paycheck.bills[i].pivot_amount == null : this.paycheck.bills[i].pivot_amount_project);
        }
        return total;
      },
      paycheck_paid_on() {
        if(this.paycheck == null) return "";
        return moment(this.paycheck.paid_on).format('ddd, MMM D');
      }
    }
  }
</script>
