<template>
  <div>
    <b-modal v-model="showModal" ref="modify-contribution-modal" id="modify-contribution-modal" title="Modify Goal Contribution" centered no-close-on-backdrop>
      <b-alert :show="message.countDown"
               dismissible
               :variant="message.type"
               fade
               @dismissed="message.countDown=0"
               @dismiss-count-down="countDownChanged">
        {{message.message}}
      </b-alert>
      <form @submit.prevent="onSave(contribution)">
        <h3>{{ monthSpanToString }}</h3>
        <div class="row">
          <div class="col form-group">
            <label for="amount">Amount</label>
            <div class="input-group">
              <div class="input-group-prepend">
                <div class="input-group-text">$</div>
              </div>
              <input class="form-control"
                     id="amount"
                     type="text"
                     placeholder="Amount"
                     v-model="contribution.amount"
                     @blur="contribution.amount = formatAmount(contribution.amount)"
                     :class="validationClasses('contribution', 'amount')">
            </div>
            <div v-if="!$v.contribution.amount.required" class="invalid-feedback d-block">
              Amount is required
            </div>
            <div v-if="!$v.contribution.amount.validDecimal" class="invalid-feedback d-block">
              Amount must be a valid decimal ($xx xxx xxx.xx)
            </div>
            <div v-if="$v.contribution.amount.validDecimal && !$v.contribution.amount.notZero" class="invalid-feedback d-block">
              Amount must be greater than zero (0)
            </div>
          </div>
          <div class="col form-group">
            <label for="day_due_on">Day Due: </label>
            <input class="form-control"
                   id="day_due_on"
                   type="number"
                   placeholder="Day Due"
                   v-model.number="contribution.day_due_on"
                   :class="validationClasses('contribution', 'day_due_on')">
            <div v-if="!$v.contribution.day_due_on.integer || !$v.contribution.day_due_on.minValue || !$v.contribution.day_due_on.maxValue" class="invalid-feedback">
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
                   v-model="contribution.start_on"
                   :class="validationClasses('contribution', 'start_on')">
            <div v-if="!$v.contribution.start_on.required" class="invalid-feedback">
              Start On is required (valid date)
            </div>
            <div v-if="!$v.contribution.start_on.noOverlap" class="invalid-feedback">
              Start On cannot overlap with other scheduled contributions
            </div>
            <div v-if="$v.contribution.start_on.noOverlap && !$v.contribution.start_on.noInterlap" class="invalid-feedback">
              Another contribution's Start On and/or End On are contianed in this contribution's Start On and End On
            </div>
          </div>
          <div class="col form-group">
            <label for="end_on">End On Date: </label>
            <input class="form-control"
                   id="end_on"
                   type="date"
                   placeholder="mm/dd/yyyy"
                   v-model="contribution.end_on"
                   :class="validationClasses('contribution', 'end_on')">
            <div v-if="!$v.contribution.end_on.required" class="invalid-feedback">
              End On is required (valid date)
            </div>
            <div v-if="$v.contribution.end_on.required && !$v.contribution.end_on.minDate" class="invalid-feedback">
              End On Date must be after the Start On Date
            </div>
            <div v-if="!$v.contribution.end_on.noOverlap" class="invalid-feedback">
              End On cannot overlap with other scheduled contributions
            </div>
            <div v-if="$v.contribution.end_on.noOverlap && !$v.contribution.end_on.noInterlap" class="invalid-feedback">
              Another contribution's Start On and/or End On are contianed in this contribution's Start On and End On
            </div>
          </div>
        </div>
      </form>
      <template slot="modal-footer">
        <b-button size="sm" variant="sub1" @click="$emit('close')">
          Cancel
        </b-button>
        <b-button size="sm" variant="base" @click="onSave(contribution)">
          Save
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
  import { BModal, BAlert, BButton } from 'bootstrap-vue';
  import { helpers, required, integer, minLength, maxLength, minValue, maxValue } from 'vuelidate/lib/validators';
  import { cloneDeep } from 'lodash';
  import moment from 'moment';
  import Alert from '../../api/alert.js';
  import { EventBus } from '../../event-bus.js';
  import { numberToString, emptyStringToNull, dateToFormatedString } from '../../utils/main.js';
  const validDecimal = helpers.regex('validDecimal', /^\d{0,6}(\.\d{0,2})?$/); // double(8,2)
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
        type: "",
        contribution: {
          id: null,
          goal_id: null,
          amount: null,
          day_due_on: null,
          diff: null,
          monthSpan: [],
          start_on: "",
          end_on: "",
          created_at: "",
          updated_at: "",
        },
        contribution_paychecks: [],
        contributions: [],
        contributionPaychecksDeleted: [],
      };
    },
    validations() {
      return {
        contribution: {
          amount: {
            required,
            validDecimal,
            notZero: (amount) => ((amount === "" || amount === null) || (Number(amount) > 0)),
          },
          day_due_on: {
            integer,
            minValue: minValue(1),
            maxValue: maxValue(31),
          },
          start_on: {
            required,
            noOverlap: (start_on) => this.noOverlap(start_on),
            noInterlap: (start_on) => this.noInterlap(start_on, this.contribution.end_on),
          },
          end_on: {
            required,
            minDate: (end_on) => (end_on == "" || moment(end_on).isAfter(this.contribution.start_on)),
            noOverlap: (end_on) => this.noOverlap(end_on),
            noInterlap: (end_on) => this.noInterlap(this.contribution.start_on, end_on),
          },
        },
      };
    },
    created() {
      EventBus.$on('modify-contribution', (data) => {
        this.type = data.type;
        this.index = data.index;
        this.contribution_paychecks = [];
        if(this.type == 'modify-goal') {
          if(data.contributions[this.index].hasOwnProperty('id')) {
            this.contribution.id = data.contributions[this.index].id;
            this.contribution.created_at = data.contributions[this.index].created_at;
            this.contribution.updated_at = data.contributions[this.index].updated_at;
          } else {
            this.contribution.id = null;
            this.contribution.created_at = null;
            this.contribution.updated_at = null;
          }
          this.contribution.goal_id = data.contributions[this.index].goal_id;
          this.contributionPaychecks.forEach((contribution_paycheck) => {
            if(contribution_paycheck.contribution_id === this.contribution.id) {
              this.contribution_paychecks.push(cloneDeep(contribution_paycheck));
            }
          });
        }
        this.contribution.amount = data.contributions[this.index].amount;
        this.contribution.day_due_on = data.contributions[this.index].day_due_on;
        this.contribution.diff = data.contributions[this.index].diff;
        this.contribution.monthSpan = cloneDeep(data.contributions[this.index].monthSpan);
        this.contribution.start_on = data.contributions[this.index].start_on;
        this.contribution.end_on = data.contributions[this.index].end_on;
        this.contributionPaychecksDeleted = cloneDeep(data.contributionPaychecksDeleted);
        this.contributions = cloneDeep(data.contributions);
        this.showModal = true;
      });
      EventBus.$on('save-modify-contribution-confirm-save', (data) => {
        this.onSaveConfirm(data.contributionPaychecksToRemove);
      });
    },
    beforeDestroy() {
      EventBus.$off('modify-contribution');
      EventBus.$off('save-modify-contribution-confirm-save');
    },
    methods: {
      onSave(contribution) {
        if(!this.$v.contribution.$invalid) {
          if(this.type == 'modify-goal') {
            let contributionPaychecksToRemove = [];
            this.contribution_paychecks.forEach((contribution_paycheck) => {
              if(!moment(this.getPaycheck(contribution_paycheck.paycheck_id).paid_on).isBetween(this.contribution.start_on, this.contribution.end_on, 'month', '[]')) {
                // if contribution_paycheck is NOT in contributionPaychecksDeleted, add it to contributionPaychecksToRemove
                if(this.contributionPaychecksDeleted.find(
                  (this_contribution_paycheck) => contribution_paycheck.paycheck_id === this_contribution_paycheck.paycheck_id && contribution_paycheck.contribution_id === this_contribution_paycheck.contribution_i
                ) === undefined) {
                  contributionPaychecksToRemove.push(contribution_paycheck);
                }
              }
            });
            if(contributionPaychecksToRemove.length > 0) {
              EventBus.$emit('save-modify-contribution-confirm', {
                contributionPaychecksToRemove: contributionPaychecksToRemove,
                index: this.index,
                contribution: contribution,
              });
              return;
            }
          }
          this.onSaveConfirm();
        }
      },
      onSaveConfirm(contributionPaychecksToRemove = []) {
        this.contribution.day_due_on = emptyStringToNull(this.contribution.day_due_on);
        let newContribution = cloneDeep(this.contribution);
        newContribution.monthSpan = cloneDeep(this.monthSpan);
        newContribution.diff = Math.ceil(moment(newContribution.end_on).diff(newContribution.start_on, 'months', true));
        EventBus.$emit('save-modify-contribution', {
          type: this.type,
          index: this.index,
          contribution: newContribution,
          contributionPaychecksToRemove: contributionPaychecksToRemove,
        });
        this.showModal = false;
      },
      getContributionPaychecks(contribution_id = null) {
        this.contributionPaychecks.filter((contribution_paycheck) => {
          return contribution_paycheck.contribution_id === contribution_id;
        });
      },
      getPaycheck(paycheck_id) {
        return this.$store.getters.getPaycheck(paycheck_id) || { paid_on: '' };
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
      noOverlap(any_on) {
        for(let i in this.contributions) {
          if(this.contributions[i].monthSpan[0] === this.contribution.monthSpan[0]) {
            continue;
          }
          if(moment(any_on).isBetween(this.contributions[i].start_on, this.contributions[i].end_on, 'month', "[]")) {
            return false;
          }
        }
        return true;
      },
      noInterlap(start_on, end_on) {
        for(let i in this.contributions) {
          if(this.contributions[i].monthSpan[0] === this.contribution.monthSpan[0]) {
            continue;
          }
          if(moment(this.contributions[i].start_on).isBetween(start_on, end_on, 'month', "[]")
          || moment(this.contributions[i].end_on).isBetween(start_on, end_on, 'month', "[]")) {
            return false;
          }
        }
        return true;
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
      contributionPaychecks() {
        return this.$store.getters.getContributionPaychecks;
      },
      monthSpan() {
        if(!this.$v.contribution.$invalid) {
          if(moment(this.contribution.start_on).isSame(this.contribution.end_on, 'month')) {
            return [dateToFormatedString(this.contribution.start_on, 'MMM YYYY')];
          } else {
            return [dateToFormatedString(this.contribution.start_on, 'MMM YYYY'), dateToFormatedString(this.contribution.end_on, 'MMM YYYY')]
          }
        } else {
          return [];
        }
      },
      monthSpanToString() {
        if(this.monthSpan.length > 0) {
          if(this.monthSpan.length > 1) {
            return this.monthSpan[0] + " - " + this.monthSpan[1];
          }
          return this.monthSpan[0];
        }
        return "";
      },
    },
  };
</script>
