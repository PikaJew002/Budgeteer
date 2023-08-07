<template>
  <div id="pair-paycheck">
    <Alert
      id="pair-paycheck-alert"
      dismissible
      :show="message.show"
      :duration="message.time"
      :variant="message.type"
      @dismissed="onDismissed()"
    >
     {{ message.message }}
    </Alert>
    <Alert
      id="pair-paycheck-alert-success"
      variant="success"
      dismissible
      :show="showPairAlert"
      @dismissed="onDismissAlert()"
    >
      Select a {{ type == "" ? "bill" : "paycheck" }} to pair with this {{ type == "" ? "paycheck" : type }}
    </Alert>
    <Modal :show="show" @hide="onHideModal()" id="pair-paycheck-modal">
      <template v-slot:modal-header>
        <h5>{{ (isUpdate ? 'Update' : 'Pair') }} {{ (type == null || type == "") ? "" : (type.charAt(0).toUpperCase() + type.slice(1)) }}-Paycheck</h5>
        <button class="close" type="button" aria-label="Close" @click="onClose()">
          <span aria-hidden="true">&times;</span>
        </button>
      </template>
      <form @submit.prevent="onSave()" v-if="paycheck != null && (bill != null || contribution != null)">
        <div class="row">
          <div class="col">
            <h5>{{ income.name }} ${{ amountProjectIfAmountNull(paycheck) }}</h5>
            <small class="text-muted mb-0">Paid on: {{ paycheck_paid_on }}</small><br />
            <small class="text-muted mb-0">Left over: ${{ paycheckLeft }}</small>
          </div>
          <div class="col form-group">
            <h5>{{ bill.name }}</h5>
            <label class="sr-only" for="amount">Amount</label>
            <div class="input-group">
              <div class="input-group-prepend">
                <div class="input-group-text">$</div>
              </div>
              <input v-if="projected"
                     class="form-control"
                     id="amount"
                     type="text"
                     placeholder="Amount"
                     v-model="pair.amount_project"
                     @blur="pair.amount_project = formatAmount(pair.amount_project)"
                     :class="validationClasses(v$, 'pair', 'amount_project')">
              <input v-else
                     class="form-control"
                     id="amount"
                     type="text"
                     placeholder="Amount"
                     v-model="pair.amount"
                     @blur="pair.amount = formatAmount(pair.amount)"
                     :class="validationClasses(v$, 'pair', 'amount')">
            </div>
            <div class="custom-control custom-checkbox">
              <input class="custom-control-input"
                     id="projected"
                     type="checkbox"
                     v-model="projected"
                     @change="onCheck()">
              <label class="custom-control-label" for="projected">Projected?</label>
            </div>
            <div v-if="!v$.pair.amount.required || !v$.pair.amount_project.required" class="invalid-feedback d-block">
              Amount is required
            </div>
            <div v-if="!v$.pair.amount.validDecimal || !v$.pair.amount_project.validDecimal" class="invalid-feedback d-block">
              Amount must be a valid decimal ($xxxx.xx)
            </div>
            <div v-if="(v$.pair.amount.validDecimal && !v$.pair.amount.notZero) || (v$.pair.amount_project.validDecimal && !v$.pair.amount_project.notZero)" class="invalid-feedback d-block">
              Amount must be greater than zero (0)
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col form-group">
            <label for="due_on">Due on: </label>
            <input class="form-control"
                   id="due_on"
                   type="date"
                   v-model="pair.due_on"
                   :class="validationClasses(v$, 'pair', 'due_on')">
            <div v-if="!v$.pair.due_on.required" class="invalid-feedback">
              Due On is required
            </div>
          </div>
          <div class="col form-group">
            <label for="paid_on">Paid on: </label>
            <input class="form-control"
                   id="paid_on"
                   type="date"
                   v-model="pair.paid_on"
                   :class="validationClasses(v$, 'pair', 'paid_on')">
            <div v-if="!v$.pair.paid_on.maxValue" class="invalid-feedback">
              Paid On must be before or on the date due
            </div>
          </div>
        </div>
      </form>
      <template v-slot:modal-footer>
        <button v-if="isUpdate" class="btn btn-danger btn-sm" @click="onDeletePair()">
          Delete
        </button>
        <button class="btn btn-sub1 btn-sm" @click="onClose()">
          Cancel
        </button>
        <button class="btn btn-base btn-sm" @click="onSave()">
          Save
        </button>
      </template>
    </Modal>
  </div>
</template>

<script>
import { useVuelidate } from '@vuelidate/core';
import { helpers, required, requiredIf, maxValue } from '@vuelidate/validators';
import Alert from '../Alert.vue';
import Modal from '../Modal.vue';
import AlertMixin from '../../api/alert.js';
import { dateToFormatedString, dateToString, capitalize, emptyStringToNull, numberToString, otherIfNull } from '../../utils/main.js';
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
  mixins: [AlertMixin],
  setup() {
    return { v$: useVuelidate() }
  },
  mounted() {
    this.$eventBus.on('paycheck-pair-start', (paycheck) => {
      this.paycheck = { ...paycheck };
      this.pair.paycheck_id = paycheck.id;
      this.type = ""; // paycheck was selected first
      this.showPairAlert = true;
    });
    this.$eventBus.on('paycheck-pairable-pair-start', ({ pairable, month, type}) => {
      this.type = type; // bill or contribution (pairable) was selected first
      this[this.type] = { ...pairable };
      this.month = month;
      this.pair[this.type + '_id'] = this[this.type].id;
      this.showPairAlert = true;
    });
    this.$eventBus.on('paycheck-pair-end', (paycheck) => {
      if(paycheck == null) {
        this.showPairAlert = false;
        this.onHideModal();
        return;
      }
      this.paycheck = { ...paycheck };
      this.pair.paycheck_id = paycheck.id;
      this.pair.amount = numberToString(this[this.type].amount);
      this.pair.due_on = dateToString(this.month[1], this.month[0], this[this.type].day_due_on == null ? 1 : this[this.type].day_due_on);
      this.pair.paid_on = "";
      this.showPairAlert = false;
      this.$emit('open');
    });
    this.$eventBus.on('paycheck-pairable-pair-end', ({ pairable, month, type }) => {
      // arr: 0: pairableObj, 1: month, 2: pairableType (bill or contribution)
      if(type === null) {
        this.showPairAlert = false;
        this.onHideModal();
        return;
      }
      this.month = month;
      this.type = type;
      this[this.type] = { ...pairable }; // bill or contribution
      this.pair[this.type+"_id"] = this[this.type].id;
      this.pair.amount = numberToString(this[this.type].amount);
      this.pair.due_on = dateToString(this.month[1], this.month[0], this[this.type].day_due_on == null ? 1 : this[this.type].day_due_on);
      this.showPairAlert = false;
      this.$emit('open');
    });
    this.$eventBus.on('pair-update', ({ pairable, paycheck, type }) => {
      this.isUpdate = true;
      this.type = type; // is bill or contribution
      this[this.type] = { ...pairable };
      this.paycheck = { ...paycheck };
      this.pair[this.type+'_id'] = this[this.type].id;
      this.pair.paycheck_id = this.paycheck.id;
      let pivotModel = this.$store.getters[`get${capitalize(this.type)}Paycheck`](this[this.type].id, this.paycheck.id);
      this.pair.paid_on = pivotModel.paid_on;
      this.pair.due_on = pivotModel.due_on;
      this.projected = pivotModel.amount == null;
      this.pair.amount = emptyStringToNull(numberToString(pivotModel.amount));
      this.pair.amount_project = emptyStringToNull(numberToString(pivotModel.amount_project));
      this.pair.created_at = pivotModel.created_at;
      this.pair.updated_at = pivotModel.updated_at;
      this.$emit('open');
    });
  },
  beforeUnmount() {
    this.$eventBus.off('paycheck-pair-start');
    this.$eventBus.off('bill-pair-start');
    this.$eventBus.off('paycheck-pair-end');
    this.$eventBus.off('bill-pair-end');
    this.$eventBus.off('pair-update');
  },
  data() {
    return {
      isUpdate: false,
      showPairAlert: false,
      type: "",
      bill: null,
      paycheck: null,
      projected: false,
      month: [],
      pair: {
        bill_id: null,
        paycheck_id: null,
        amount: null,
        amount_project: null,
        due_on: "",
        paid_on: "",
        created_at: "",
        updated_at: "",
      },
    };
  },
  validations() {
    return {
      pair: {
        amount_project: {
          required: requiredIf(function() {
            return !this.pair.amount;
          }),
          validDecimal,
          notZero,
        },
        amount: {
          required: requiredIf(function() {
            return !this.pair.amount_project;
          }),
          validDecimal,
          notZero,
        },
        due_on: {
          required,
        },
        paid_on: {
          maxValue,
        },
      },
    };
  },
  methods: {
    onDismissAlert() {
      // if paycheck is null
      if(this.paycheck === null) {
        this.onHideModal();
        this.$eventBus.emit('paycheck-pair-end', null);
        return;
      }
      // if pairable entity (bill or contribution) is not selected
      // OR
      // if pairable entity (bill or contribution) is null
      if(this.type === '' || this[this.type] === null) {
        this.onHideModal();
        this.$eventBus.emit('paycheck-pairable-pair-end', { type: null });
        return;
      }
      // if the pairable entity (bill or contribution) is already paired to the paycheck
      if(this.$store.getters[`get${capitalize(this.type)}Paycheck`](this.type+'_id', this.paycheck.id) !== undefined) {
        this.showAlert('warning', "The "+this.type+" and paycheck selected are already paired.");
        this.onHideModal();
        return;
      }
      this.pair.amount = this.formatAmount(this.pair.amount);
      this.onDismissed();
      this.$emit('open');
    },
    onSave() {
      if(!this.v$.pair.$invalid) {
        this.pair.paid_on = emptyStringToNull(this.pair.paid_on);
        this.$store.dispatch(`${this.isUpdate ? 'modify' : 'attach'}${capitalize(this.type)}Paycheck`, this.pair);
        this.onClose();
      }
    },
    onClose() {
      this.$emit('close');
      this.isUpdate = false;
    },
    onDeletePair() {
      this.$store.dispatch(`detach${capitalize(this.type)}Paycheck`, this.pair);
      this.onClose();
    },
    onHideModal() {
      this.$emit('close');
      this.type = "";
      this.bill = null;
      this.paycheck = null;
      this.pair.bill_id = null;
      this.pair.contribution_id = null;
      this.pair.paycheck_id = null;
      this.pair.amount = null;
      this.pair.amount_project = null;
      this.pair.due_on = "";
      this.pair.paid_on = "";
      this.pair.created_at = "";
      this.pair.updated_at = "";
    },
    formatAmount(amount) {
      return numberToString(amount);
    },
    /* @TODO extract (along with input) into amount-input component */
    validationClasses(v$, obj, attr) {
      return validationInputClasses(v$, obj, attr);
    },
    amountProjectIfAmountNull(obj) {
      return otherIfNull(obj, 'amount', 'amount_project');
    },
    onCheck() {
      if(this.projected) {
        this.pair.amount_project = this.pair.amount;
        this.pair.amount = null;
      } else {
        this.pair.amount = this.pair.amount_project;
        this.pair.amount_project = null;
      }
    },
  },
  computed: {
    income() {
      if(this.paycheck === null) return {};
      return this.$store.getters.getIncome(this.paycheck.income_id);
    },
    billPaychecks() {
      if(this.paycheck === null || this.bill === null) return [];
      return this.$store.getters.getBillPaychecks.filter((bill_paycheck) => {
        return bill_paycheck.paycheck_id === this.paycheck.id;
      });
    },
    paycheckLeft() {
      if(this.paycheck === null) return 0;
      let total = otherIfNull(this.paycheck, 'amount', 'amount_project');
      this.billPaychecks.forEach((bill_paycheck) => {
        if(bill_paycheck.bill_id !== this.pair.bill_id) {
          total -= otherIfNull(bill_paycheck, 'amount', 'amount_project');
        }
      });
      let amount = otherIfNull(this.pair, 'amount', 'amount_project')
      if(amount !== "") {
        total -= Number(amount);
      }
      return total.toFixed(2);
    },
    paycheck_paid_on() {
      if(this.paycheck === null) return "";
      return dateToFormatedString(this.paycheck.paid_on, 'ddd, MMM D');
    },
  },
}
</script>
