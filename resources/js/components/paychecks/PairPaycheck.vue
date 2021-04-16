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
      Select a {{ type == "" ? "bill or contribution" : "paycheck" }} to pair with this {{ type == "" ? "paycheck" : type }}
    </b-alert>
    <b-modal v-model="showModal" ref="pair-paycheck-modal" id="pair-paycheck-modal" centered no-close-on-backdrop @hidden="onHideModal()">
      <template slot="modal-header">
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
            <h5>{{ type == 'bill' ? bill.name : goal.name }}</h5>
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
                     :class="validationClasses('pair', 'amount_project')">
              <input v-else
                     class="form-control"
                     id="amount"
                     type="text"
                     placeholder="Amount"
                     v-model="pair.amount"
                     @blur="pair.amount = formatAmount(pair.amount)"
                     :class="validationClasses('pair', 'amount')">
            </div>
            <div class="custom-control custom-checkbox">
              <input class="custom-control-input"
                     id="projected"
                     type="checkbox"
                     v-model="projected"
                     @change="onCheck()">
              <label class="custom-control-label" for="projected">Projected?</label>
            </div>
            <div v-if="!$v.pair.amount.required || !$v.pair.amount_project.required" class="invalid-feedback d-block">
              Amount is required
            </div>
            <div v-if="!$v.pair.amount.validDecimal || !$v.pair.amount_project.validDecimal" class="invalid-feedback d-block">
              Amount must be a valid decimal ($xxxx.xx)
            </div>
            <div v-if="($v.pair.amount.validDecimal && !$v.pair.amount.notZero) || ($v.pair.amount_project.validDecimal && !$v.pair.amount_project.notZero)" class="invalid-feedback d-block">
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
                   :class="validationClasses('pair', 'due_on')">
            <div v-if="!$v.pair.due_on.required" class="invalid-feedback">
              Due On is required
            </div>
          </div>
          <div class="col form-group">
            <label for="paid_on">Paid on: </label>
            <input class="form-control"
                   id="paid_on"
                   type="date"
                   v-model="pair.paid_on"
                   :class="validationClasses('pair', 'paid_on')">
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
  import Alert from '../../api/alert.js';
  import { EventBus } from '../../event-bus.js';
  import { dateToFormatedString, dateToString, capitalize, emptyStringToNull, numberToString, otherIfNull } from '../../utils/main.js';
  const validDecimal = helpers.regex('validDecimal', /^\d{0,4}(\.\d{0,2})?$/);
  export default {
    components: {
      'b-alert': BAlert,
      'b-button': BButton,
      'b-modal': BModal,
    },
    mixins: [Alert],
    created() {
      EventBus.$on('paycheck-pair-start', paycheck => {
        this.paycheck = paycheck;
        this.pair.paycheck_id = paycheck.id;
        this.type = ""; // paycheck was selected first
        this.showPairAlert = true;
      });
      EventBus.$on('paycheck-pairable-pair-start', arr => {
        // payload: 0: pairableObj, 1: month, 2: pairableType (bill or contribution)
        this.type = arr[2]; // bill or contribution (pairable) was selected first
        this[this.type] = arr[0];
        this.month = arr[1];
        this.pair[this.type + '_id'] = this[this.type].id;
        this.showPairAlert = true;
      });
      EventBus.$on('paycheck-pair-end', paycheck => {
        if(paycheck == null) {
          this.showPairAlert = false;
          this.onHideModal();
          return;
        }
        this.paycheck = paycheck;
        this.pair.paycheck_id = paycheck.id;
        this.pair.amount = numberToString(this[this.type].amount);
        this.pair.due_on = dateToString(this.month[1], this.month[0], this[this.type].day_due_on == null ? 1 : this[this.type].day_due_on);
        this.pair.paid_on = "";
        this.showPairAlert = false;
      });
      EventBus.$on('paycheck-pairable-pair-end', arr => {
        // arr: 0: pairableObj, 1: month, 2: pairableType (bill or contribution)
        if(arr === null) {
          this.showPairAlert = false;
          this.onHideModal();
          return;
        }
        this.month = arr[1];
        this.type = arr[2];
        this[this.type] = arr[0]; // bill or contribution
        this.pair[this.type+"_id"] = this[this.type].id;
        this.pair.amount = numberToString(this[this.type].amount);
        this.pair.due_on = dateToString(this.month[1], this.month[0], this[this.type].day_due_on == null ? 1 : this[this.type].day_due_on);
        this.showPairAlert = false;
      });
      EventBus.$on('pair-update', obj => {
        this.isUpdate = true;
        this.type = obj.type; // is bill or contribution
        this[this.type] = obj.pairable;
        this.paycheck = obj.paycheck;
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
        contribution: null,
        paycheck: null,
        projected: false,
        month: [],
        pair: {
          bill_id: null,
          contribution_id: null,
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
            notZero: (amount_project) => ((amount_project == "" || amount_project == null) || (Number(amount_project) > 0)),
          },
          amount: {
            required: requiredIf(function() {
              return !this.pair.amount_project;
            }),
            validDecimal,
            notZero: (amount) => ((amount == "" || amount == null) || (Number(amount) > 0)),
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
          EventBus.$emit('paycheck-pair-end', null);
          return;
        }
        // if pairable entity (bill or contribution) is null
        if(this[this.type] === null) {
          this.onHideModal();
          EventBus.$emit('paycheck-pairable-pair-end', null);
          return;
        }
        // if the pairable entity (bill or contribution) is already paired to the paycheck
        if(this.$store.getters[`get${capitalize(this.type)}Paycheck`](this.type+'_id', this.paycheck.id) !== undefined) {
          this.showAlert('warning', "The "+this.type+" and paycheck selected are already paired.");
          this.onHideModal();
          return;
        }
        this.pair.amount = this.formatAmount(this.pair.amount);
        this.showModal = true;
      },
      onSave() {
        if(!this.$v.pair.$invalid) {
          this.pair.amount = emptyStringToNull(this.pair.amount);
          this.pair.amount_project = emptyStringToNull(this.pair.amount_project);
          this.pair.paid_on = emptyStringToNull(this.pair.paid_on);
          this.$store.dispatch(`${this.isUpdate ? 'modify' : 'attach'}${capitalize(this.type)}Paycheck`, this.pair);
          this.onClose();
        }
      },
      onClose() {
        this.showModal = false;
        this.isUpdate = false;
      },
      onDeletePair() {
        this.$store.dispatch(`detach${capitalize(this.type)}Paycheck`, this.pair);
        this.onClose();
      },
      onHideModal() {
        this.type = "";
        this.bill = null;
        this.contribution = null;
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
      validationClasses(obj, attr) {
        return {
          'is-invalid': this.$v[obj][attr].$invalid && !this.$v[obj][attr].$pending,
          'is-valid': !this.$v[obj][attr].$invalid && !this.$v[obj][attr].$pending,
        };
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
      goal() {
        if(this.contribution === null) return {};
        return this.$store.getters.getGoal(this.contribution.goal_id);
      },
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
      contributionPaychecks() {
        if(this.paycheck === null || this.contribution === null) return [];
        return this.$store.getters.getContributionPaychecks.filter((contribution_paycheck) => {
          return contribution_paycheck.paycheck_id === this.paycheck.id;
        });
      },
      paycheckLeft() {
        if(this.paycheck === null) return 0;
        let total = otherIfNull(this.paycheck, 'amount', 'amount_project');
        this.billPaychecks.forEach((bill_paycheck) => {
          if(bill_paycheck.bill_id != this.pair.bill_id) {
            total -= otherIfNull(bill_paycheck, 'amount', 'amount_project');
          }
        });
        this.contributionPaychecks.forEach((contribution_paycheck) => {
          if(contribution_paycheck.contribution_id != this.pair.contribution_id) {
            total -= otherIfNull(contribution_paycheck, 'amount', 'amount_project');
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
