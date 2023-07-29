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
        <h3>{{ monthSpan }}</h3>
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
                     :class="validationClasses($v, 'contribution', 'amount')">
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
                   :class="validationClasses($v, 'contribution', 'day_due_on')">
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
                   :class="validationClasses($v, 'contribution', 'start_on')">
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
                   :class="validationClasses($v, 'contribution', 'end_on')">
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
  
  import { numberToString, emptyStringToNull, dateToFormatedString, copyObjectProperties } from '../../utils/main.js';
  import { notZero, validationInputClasses } from '../../utils/validation.js';
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
          start_on: "",
          end_on: "",
          created_at: "",
          updated_at: "",
        },
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
      this.$eventBus.on('modify-contribution', (contribution) => {
        copyObjectProperties(contribution, this.contribution);
        this.showModal = true;
      });
      this.$eventBus.on('save-modify-contribution-confirm', (contributionPaychecksToRemove) => {
        this.onSaveConfirm(this.contribution, contributionPaychecksToRemove);
      });
    },
    beforeDestroy() {
      this.$eventBus.off('modify-contribution');
      this.$eventBus.off('save-modify-contribution-confirm');
    },
    methods: {
      onSave(contribution) {
        if(!this.$v.contribution.$invalid) {
          contribution.day_due_on = emptyStringToNull(contribution.day_due_on);
          if(this.contributionPaychecksToRemove.length === 0) {
            this.onSaveConfirm(contribution);
            return;
          }
          this.$eventBus.emit('save-modify-contribution', this.contributionPaychecksToRemove);
        }
      },
      onSaveConfirm(contribution, contributionPaychecksToRemove = []) {
        Promise.all(contributionPaychecksToRemove.map(async (contributionPaycheck) => {
          return await this.$store.dispatch('detachContributionPaycheck', contributionPaycheck);
        })).then(() => {
          this.$store.dispatch('editContribution', contribution);
        });
        // @TODO loading state to show while API call finishes removing/editing
        this.showModal = false;
      },
      getPaycheck(paycheck_id) {
        return this.$store.getters.getPaycheck(paycheck_id) || { paid_on: '' };
      },
      formatAmount(amount) {
        return numberToString(amount);
      },
      /* @TODO extract (along with input) into amount-input component */
      validationClasses(v$, obj, attr) {
        return validationInputClasses(v$, obj, attr);
      },
      noOverlap(any_on) {
        return !this.otherContributions.some((contribution) => {
          return moment(any_on).isBetween(contribution.start_on, contribution.end_on, 'month', "[]")
        });
      },
      noInterlap(start_on, end_on) {
        return !this.otherContributions.some((contribution) => {
          return moment(contribution.start_on).isBetween(start_on, end_on, 'month', "[]")
          || moment(contribution.end_on).isBetween(start_on, end_on, 'month', "[]");
        });
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
      /* other contributions belonging to the goal the contribution being modified
         belongs to (not including the contribution being modified) */
      otherContributions() {
        return this.$store.getters.getContributions.filter((contribution) => {
          return contribution.goal_id === this.contribution.goal_id && contribution.id !== this.contribution.id;
        });
      },
      /* contribution-paychecks belonging to the contribution being modified */
      contributionPaychecks() {
        return this.$store.getters.getContributionPaychecks.filter((contributionPaycheck) => {
          return contributionPaycheck.contribution_id === this.contribution.id;
        });
      },
      /* contribution-paychecks belonging to the contribution being modified
         that will be removed on save (overlap or interlap start_on or end_on) */
      contributionPaychecksToRemove() {
        return this.contributionPaychecks.filter((contributionPaycheck) => {
          return !moment(this.getPaycheck(contributionPaycheck.paycheck_id).paid_on).isBetween(this.contribution.start_on, this.contribution.end_on, 'month', '[]');
        });
      },
      monthSpan() {
        if(!this.$v.contribution.$invalid) {
          return (
            moment(this.contribution.start_on).isSame(this.contribution.end_on, 'month')
            ? dateToFormatedString(this.contribution.start_on, 'MMM YYYY')
            : dateToFormatedString(this.contribution.start_on, 'MMM YYYY') + " - " + dateToFormatedString(this.contribution.end_on, 'MMM YYYY')
          );
        } else {
          return "";
        }
      },
    },
  };
</script>
