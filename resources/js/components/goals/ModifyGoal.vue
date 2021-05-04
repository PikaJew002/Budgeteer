<template>
  <div id="modify-goal">
    <b-alert :show="message.countDown"
             dismissible
             :variant="message.type"
             fade
             @dismissed="message.countDown=0"
             @dismiss-count-down="countDownChanged">
      {{message.message}}
    </b-alert>
    <b-modal v-model="showModal" ref="modify-goal-modal" id="modify-goal-modal" title="Edit Goal" centered no-close-on-backdrop>
      <div class="container-fluid">
        <form @submit.prevent="onSave()">
          <div class="row">
            <div class="col form-group">
              <label for="name">Name</label>
              <input
                v-model="goal.name"
                id="name"
                type="text"
                placeholder="Goal Name"
                class="form-control"
                :class="validationClasses($v, 'goal', 'name')"
              >
              <div v-if="!$v.goal.name.required" class="invalid-feedback">
                Name is required
              </div>
              <div v-if="!$v.goal.name.minLength" class="invalid-feedback">
                Name must be at least 2 characters
              </div>
              <div v-if="!$v.goal.name.maxLength" class="invalid-feedback">
                Name cannot be more than 50 characters
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col form-group">
              <label for="amount">Amount</label>
              <div class="input-group">
                <div class="input-group-prepend">
                  <div class="input-group-text">$</div>
                </div>
                <input
                  v-model="goal.amount"
                  @blur="goal.amount = formatAmount(goal.amount)"
                  id="amount"
                  type="text"
                  placeholder="Amount"
                  class="form-control"
                  :class="validationClasses($v, 'goal', 'amount')"
                >
              </div>
              <div v-if="!$v.goal.amount.required" class="invalid-feedback d-block">
                Amount is required
              </div>
              <div v-if="!$v.goal.amount.validDecimal" class="invalid-feedback d-block">
                Amount must be a valid decimal ($xx xxx xxx.xx)
              </div>
              <div v-if="$v.goal.amount.validDecimal && !$v.goal.amount.notZero" class="invalid-feedback d-block">
                Amount must be greater than zero (0.00)
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col form-group">
              <label for="initial_amount">Initial Amount (optional)</label>
              <div class="input-group">
                <div class="input-group-prepend">
                  <div class="input-group-text">$</div>
                </div>
                <input
                  v-model="goal.initial_amount"
                  @blur="goal.initial_amount = formatAmount(goal.initial_amount)"
                  id="initial_amount"
                  type="text"
                  placeholder="Amount"
                  class="form-control"
                  :class="validationClasses($v, 'goal', 'initial_amount')"
                >
              </div>
              <div v-if="!$v.goal.initial_amount.validDecimal" class="invalid-feedback d-block">
                Initial Amount must be a valid decimal ($xx xxx xxx.xx)
              </div>
              <div v-if="$v.goal.initial_amount.validDecimal && !$v.goal.initial_amount.notZero" class="invalid-feedback d-block">
                Initial Amount must be greater than zero (0.00)
              </div>
            </div>
          </div>
          <div class="d-flex justify-content-between align-items-center">
            <h6>Contributions</h6>
            <button type="button" class="btn btn-outline-base" @click="onAddContribution(goal)">+</button>
          </div>
          <hr v-if="contributions.length > 0">
          <div class="d-flex flex-row flex-nowrap overflow-auto">
            <div
              v-for="(contribution, index) in contributionsSorted"
              :key="contribution.id"
              class="card p-3 mx-2 my-0 border border-base rounded-sm"
              style="min-width: 100px;"
            >
              <h6 class="card-title">
                {{ getContributionMonthSpan(contribution) }}
              </h6>
              <h6 v-if="getContributionDiff(contribution) > 1" class="card-subtitle mb-2 text-muted">
                ${{ contribution.amount }} x {{ getContributionDiff(contribution) }} months = ${{ (getContributionDiff(contribution)*Number(contribution.amount)).toFixed(2) }}
              </h6>
              <h6 v-else class="card-subtitle mb-2 text-muted">
                ${{ contribution.amount }} x 1 month
              </h6>
              <button class="btn btn-outline-sub1 btn-sm" @click.prevent="onEditContribution(contribution)">Edit</button>
              <button class="btn btn-outline-sub1 btn-sm" @click.prevent="onDeleteContribution(contribution.id)">Delete</button>
            </div>
          </div>
          <hr v-if="contributions.length > 0">
          <template v-if="amountToNumber(goal.amount) > 0 && (contributionsTotal > 0 || amountToNumber(goal.initial_amount) > 0)">
            <b-progress :max="amountToNumber(goal.amount)" height="2rem" class="mb-1">
              <b-progress-bar v-if="amountToNumber(goal.initial_amount) > 0" :value="goal.initial_amount"></b-progress-bar>
              <template v-for="(contribution, index) in contributionsSorted">
                <b-progress-bar
                  v-if="getContributionPaycheckPaidTotal(contribution) > 0"
                  :key="`paid-${contribution.start_on}`"
                  :value="getContributionPaycheckPaidTotal(contribution)"
                  :variant="legend_key[index % 6]"
                  striped
                ></b-progress-bar>
                <b-progress-bar
                  :key="`total-${contribution.start_on}`"
                  :value="getContributionTotal(contribution) - getContributionPaycheckPaidTotal(contribution)"
                  :variant="legend_key[index % 6]"
                ></b-progress-bar>
              </template>
            </b-progress>
            <template v-if="amountToNumber(goal.initial_amount) > 0">
              <h5 class="text-center">
                <span class="badge badge-primary">Initial Amount</span>
              </h5>
              <div class="d-flex justify-content-between">
                <div>
                  ${{ goal.initial_amount }}
                </div>
                <div>
                  {{ ((amountToNumber(goal.initial_amount) / amountToNumber(goal.amount))*100).toFixed(2) }}%
                </div>
              </div>
            </template>
            <div v-for="(contribution, index) in contributionsSorted" :key="contribution.id">
              <h5 class="text-center">
                <span :class="'badge badge-'+legend_key[index % 6]" class="text-wrap">
                  {{ getContributionMonthSpan(contribution) }}
                </span>
              </h5>
              <div class="d-flex justify-content-between">
                <div>
                  Scheduled<br>
                  ${{ getContributionTotal(contribution).toFixed(2) }}
                </div>
                <div>
                  Paid<br>
                  ${{ getContributionPaycheckPaidTotal(contribution).toFixed(2)}} ({{ ((getContributionPaycheckPaidTotal(contribution) / getContributionTotal(contribution))*100).toFixed(2) }}%)
                </div>
              </div>
            </div>
            <template v-if="contributionsTotal > 0 || amountToNumber(goal.initial_amount) > 0">
              <h5 class="text-center">
                <span class="badge badge-base">Goal</span>
              </h5>
              <div class="d-flex justify-content-between">
                <div>
                  Scheduled<br>
                  ${{ (contributionsTotal + amountToNumber(goal.initial_amount)).toFixed(2) }} ({{ (((contributionsTotal + amountToNumber(goal.initial_amount)) / amountToNumber(goal.amount))*100).toFixed(2) }}%)
                </div>
                <div>
                  Paid<br>
                  ${{ (paychecksPaidTotal).toFixed(2) }} ({{ ((paychecksPaidTotal / amountToNumber(goal.amount))*100).toFixed(2) }}%)
                </div>
              </div>
            </template>
          </template>
        </form>
      </div>
      <template slot="modal-footer">
        <b-button size="sm" variant="danger" @click="onDelete()">
          Delete
        </b-button>
        <b-button size="sm" variant="sub1" @click="$emit('close')">
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
  import { BModal, BAlert, BButton, BProgress, BProgressBar } from 'bootstrap-vue';
  import { helpers, required, minLength, maxLength } from 'vuelidate/lib/validators';
  import moment from 'moment';
  import { cloneDeep } from 'lodash';
  import Alert from '../../api/alert.js';
  import { EventBus } from '../../event-bus.js';
  import { otherIfNull, numberToString, dateToFormatedString, copyObjectPropertiesAndApply } from '../../utils/main.js';
  import { notZero, validationInputClasses } from '../../utils/validation.js';
  const validDecimal = helpers.regex('validDecimal', /^\d{0,8}(\.\d{0,2})?$/);
  export default {
    components: {
      'b-modal': BModal,
      'b-alert': BAlert,
      'b-button': BButton,
      'b-progress': BProgress,
      'b-progress-bar': BProgressBar,
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
        goal: {
          id: null,
          name: "",
          amount: null,
          initial_amount: null,
          created_at: "",
          updated_at: "",
        },
        legend_key: [
          'success',
          'danger',
          'warning',
          'info',
          'secondary',
          'sub1',
        ],
      };
    },
    validations() {
      return {
        goal: {
          name: {
            required,
            minLength: minLength(2),
            maxLength: maxLength(255),
          },
          amount: {
            required,
            validDecimal,
            notZero,
          },
          initial_amount: {
            validDecimal,
            notZero,
          },
        },
      };
    },
    created() {
      EventBus.$on('modify-goal', (goal) => {
        copyObjectPropertiesAndApply(goal, this.goal, this.formatAmount, ['amount', 'initial_amount']);
        this.showModal = true;
      });
      EventBus.$on('delete-goal-confirm', () => {
        this.$emit('close');
      });
    },
    beforeDestroy() {
      EventBus.$off('modify-goal');
      EventBus.$off('delete-goal-confirm');
    },
    methods: {
      onAddContribution(goal) {
        EventBus.$emit('make-contribution', goal);
      },
      onDeleteContribution(id) {
        EventBus.$emit('delete-contribution', id);
      },
      onEditContribution(contribution) {
        EventBus.$emit('modify-contribution', contribution);
      },
      onSave() {
        if(!this.$v.goal.$invalid) {
          this.$store.dispatch('editGoal', this.goal);
          this.$emit('close');
        }
      },
      onDelete() {
        EventBus.$emit('delete-goal', this.goal);
      },
      formatAmount(amount) {
        return numberToString(amount);
      },
      amountToNumber(amount) {
        return (amount === '' || amount === null) ? 0 : Number(amount);
      },
      /* @TODO extract (along with input) into amount-input component */
      validationClasses(v$, obj, attr) {
        return validationInputClasses(v$, obj, attr);
      },
      getContributionMonthSpan(contribution) {
        return (
          moment(contribution.start_on).isSame(contribution.end_on, 'month')
          ? dateToFormatedString(contribution.start_on, 'MMM YYYY')
          : dateToFormatedString(contribution.start_on, 'MMM YYYY') + " - " + dateToFormatedString(contribution.end_on, 'MMM YYYY')
        );
      },
      getContributionDiff(contribution) {
        return Math.ceil(moment(contribution.end_on).diff(contribution.start_on, 'months', true));
      },
      getContributionTotal(contribution) {
        return Number(contribution.amount)*this.getContributionDiff(contribution);
      },
      getContributionPaycheckPaidTotal(contribution) {
        return this.goalContributionPaychecks.reduce((sum, contributionPaycheck) => {
          if(contributionPaycheck.contribution_id !== contribution.id || contributionPaycheck.paid_on === null) {
            return sum;
          }
          return sum + Number(otherIfNull(contributionPaycheck, 'amount', 'amount_project'));
        }, 0);
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
      contributions() {
        return this.$store.getters.getContributions.filter((contribution) => {
          return contribution.goal_id === this.goal.id;
        });
      },
      contributionsSorted() {
        return this.contributions.sort((a, b) => {
          return moment(a.start_on).isBefore(b.start_on, 'month') ? -1 : 1;
        });
      },
      goalContributionPaychecks() {
        return this.$store.getters.getContributionPaychecks.filter((contributionPaycheck) => {
          return this.contributions.map((contribution) => {
            return contribution.id;
          }).includes(contributionPaycheck.contribution_id);
        });
      },
      contributionsTotal() {
        return this.contributions.reduce((sum, contribution) => {
          return sum + Number(contribution.amount)*this.getContributionDiff(contribution);
        }, 0);
      },
      paychecksPaidTotal() {
        return this.contributions.reduce((sum, contribution) => {
          return sum + this.getContributionPaycheckPaidTotal(contribution);
        }, 0);
      },
    },
  };
</script>
