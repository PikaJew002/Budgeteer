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
        <form @submit.prevent="onSave(goal)">
          <div class="row">
            <div class="col form-group">
              <label for="name">Name</label>
              <input class="form-control"
                     id="name"
                     type="text"
                     placeholder="Goal Name"
                     v-model="goal.name"
                     :class="validationClasses('goal', 'name')">
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
                <input class="form-control"
                       id="amount"
                       type="text"
                       placeholder="Amount"
                       v-model="goal.amount"
                       @blur="goal.amount = formatAmount(goal.amount)"
                       :class="validationClasses('goal', 'amount')">
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
                <input class="form-control"
                       id="initial_amount"
                       type="text"
                       placeholder="Amount"
                       v-model="goal.initial_amount"
                       @blur="goal.initial_amount = formatAmount(goal.initial_amount)"
                       :class="validationClasses('goal', 'initial_amount')">
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
            <button type="button" class="btn btn-outline-base" @click="onAddContribution()">+</button>
          </div>
          <hr v-if="contributions.length > 0">
          <div class="d-flex flex-row flex-nowrap overflow-auto">
            <div v-for="(contribution, index) in contributions"
                 :key="contribution.start_on"
                 class="card p-3 mx-2 my-0 border border-base rounded-sm"
                 style="min-width: 100px;">
              <h6 class="card-title">
                {{ contribution.monthSpan[0] + (contribution.monthSpan.length > 1 ? " - " + contribution.monthSpan[1] : "") }}
              </h6>
              <h6 v-if="contribution.diff > 1" class="card-subtitle mb-2 text-muted">
                ${{ contribution.amount }} x {{ contribution.diff }} months = ${{ (contribution.diff*Number(contribution.amount)).toFixed(2) }}
              </h6>
              <h6 v-else class="card-subtitle mb-2 text-muted">
                ${{ contribution.amount }} x 1 month
              </h6>
              <button class="btn btn-outline-sub1 btn-sm" @click.prevent="onEditContribution(index)">Edit</button>
              <button class="btn btn-outline-sub1 btn-sm" @click.prevent="onDeleteContribution(index)">Delete</button>
            </div>
          </div>
          <hr v-if="contributions.length > 0">
          <template v-if="goalAmount > 0 && (contributionsTotal > 0 || goalInitialAmount > 0)">
            <b-progress :max="goalAmount" height="2rem" class="mb-1">
              <b-progress-bar :value="goal.initial_amount" v-if="goalInitialAmount > 0"></b-progress-bar>
              <template v-for="(contribution, index) in contributions">
                <b-progress-bar :key="`paid-${contribution.start_on}`" v-if="getContributionPaycheckPaidTotal(contribution) > 0" :value="getContributionPaycheckPaidTotal(contribution)" striped :variant="legend_key[index % 6]"></b-progress-bar>
                <b-progress-bar :key="`total-${contribution.start_on}`" :value="getContributionTotal(contribution) - getContributionPaycheckPaidTotal(contribution)" :variant="legend_key[index % 6]"></b-progress-bar>
              </template>
            </b-progress>
            <template v-if="goalInitialAmount > 0">
              <h5 class="text-center">
                <span class="badge badge-primary">Initial Amount</span>
              </h5>
              <div class="d-flex justify-content-between">
                <div>
                  ${{ goal.initial_amount }}
                </div>
                <div>
                  {{ ((goalInitialAmount / goalAmount)*100).toFixed(2) }}%
                </div>
              </div>
            </template>
            <div v-for="(contribution, index) in contributions" :key="contribution.id">
              <h5 class="text-center">
                <span :class="'badge badge-'+legend_key[index % 6]" class="text-wrap">
                  {{ contribution.monthSpan[0] + (contribution.monthSpan.length > 1 ? " - " + contribution.monthSpan[1] : "") }}
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
            <template v-if="contributionsTotal > 0 || goalInitialAmount > 0">
              <h5 class="text-center">
                <span class="badge badge-base">Goal</span>
              </h5>
              <div class="d-flex justify-content-between">
                <div>
                  Scheduled<br>
                  ${{ (contributionsTotal + goalInitialAmount).toFixed(2) }} ({{ (((contributionsTotal + goalInitialAmount) / goalAmount)*100).toFixed(2) }}%)
                </div>
                <div>
                  Paid<br>
                  ${{ (paychecksPaidTotal).toFixed(2) }} ({{ ((paychecksPaidTotal / goalAmount)*100).toFixed(2) }}%)
                </div>
              </div>
            </template>
          </template>
        </form>
      </div>
      <template slot="modal-footer">
        <b-button size="sm" variant="danger" @click="onDelete(goal)">
          Delete
        </b-button>
        <b-button size="sm" variant="sub1" @click="$emit('close')">
          Cancel
        </b-button>
        <b-button size="sm" variant="base" @click="onSave(goal)">
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
  import { otherIfNull, numberToString, dateToFormatedString } from '../../utils/main.js';
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
        },
        contributions: [],
        contributionsDeleted: [],
        contributionPaychecksDeleted: [],
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
            notZero: (amount) => ((amount == "" || amount == null) || (Number(amount) > 0)),
          },
          initial_amount: {
            validDecimal,
            notZero: (initial_amount) => ((initial_amount == "" || initial_amount == null) || (Number(initial_amount) > 0)),
          },
        },
      };
    },
    created() {
      EventBus.$on('modify-goal', goal => {
        this.goal.id = goal.id;
        this.goal.name = goal.name;
        this.goal.amount = goal.amount;
        this.goal.initial_amount = goal.initial_amount;
        this.contributions = cloneDeep(this.goalContributions);
        this.contributions.forEach((contribution) => {
          contribution.monthSpan = [dateToFormatedString(contribution.start_on, 'MMM YYYY')];
          if(!moment(contribution.start_on).isSame(contribution.end_on, 'month')) {
            contribution.monthSpan.push(dateToFormatedString(contribution.end_on, 'MMM YYYY'));
          }
          contribution.diff = Math.ceil(moment(contribution.end_on).diff(contribution.start_on, 'months', true));
        });
        this.contributions.sort(function(a, b) {
          return (moment(a.start_on).isBefore(b.start_on, 'month') ? -1 : 1);
        });
        this.contributionsDeleted = [];
        this.contributionPaychecksDeleted = [];
        this.showModal = true;
      });
      EventBus.$on('delete-goal-confirm', () => {
        this.$emit('close');
      });
      EventBus.$on('delete-contribution-confirm', (data) => {
        this.contributionPaychecks.filter((contributionPaycheck) => {
          return contributionPaycheck.contribution_id === data.contribution.id;
        }).forEach((contributionPaycheck) => {
          this.contributionPaychecksDeleted.push(cloneDeep(contributionPaycheck));
        });
        this.contributionsDeleted.push(cloneDeep(data.contribution));
        this.contributions.splice(data.index, 1);
      });
      EventBus.$on('save-make-contribution', (data) => {
        if(data.type != 'modify-goal') {
          return;
        }
        if(data.contribution.goal_id == null) {
          data.contribution.goal_id = this.goal.id;
        }
        this.onSaveContribution(cloneDeep(data.contribution));
      });
      EventBus.$on('save-modify-contribution', (data) => {
        if(data.type != 'modify-goal') {
          return;
        }
        data.contributionPaychecksToRemove.forEach((contribution_paycheck) => {
          this.contributionPaychecksDeleted.push(contribution_paycheck);
        });
        this.contributions.splice(data.index, 1);
        this.onSaveContribution(cloneDeep(data.contribution));
      });
      EventBus.$on('save-modify-goal-confirm', () => {
        this.onSaveConfirm();
      });
    },
    beforeDestroy() {
      EventBus.$off('modify-goal');
      EventBus.$off('delete-goal-confirm');
      EventBus.$off('delete-contribution-confirm');
      EventBus.$off('save-make-contribution');
      EventBus.$off('save-modify-contribution');
    },
    methods: {
      onAddContribution() {
        EventBus.$emit('make-contribution', {
          type: 'modify-goal',
          contributions: this.contributions,
        });
      },
      onDeleteContribution(index) {
        let goalContributionPaychecksToDelete = this.goalContributionPaychecks.filter((contributionPaycheck) => {
          return contributionPaycheck.contribution_id === this.contributions[index].id;
        });
        if(goalContributionPaychecksToDelete.length > 0) {
          EventBus.$emit('delete-contribution', {
            index: index,
            contribution: this.contributions[index],
            contributionPaychecks: goalContributionPaychecksToDelete,
          });
        } else {
          if(this.contributions[index].hasOwnProperty('id')) {
            this.contributionsDeleted.push(cloneDeep(this.contributions[index]));
          }
          this.contributions.splice(index, 1);
        }
      },
      onEditContribution(index) {
        EventBus.$emit('modify-contribution', {
          type: 'modify-goal',
          contributions: this.contributions,
          index: index,
          contributionPaychecksDeleted: this.contributionPaychecksDeleted,
        });
      },
      onSave(goal) {
        if(!this.$v.goal.$invalid) {
          let contributionIdsToDelete = this.contributionsDeleted.map((contribution) => contribution.id);
          let contributionPaychecksToDelete = this.contributionPaychecks.filter((contribution_paycheck) => {
            return contributionIdsToDelete.find((id) => {
              return id === contribution_paycheck.contribution_id;
            }) || false;
          });
          if(contributionPaychecksToDelete.length > 0 || this.contributionPaychecksDeleted.length > 0) {
            EventBus.$emit('save-modify-goal', {
              goal: this.goal,
              contributionPaychecksDeleted: this.contributionPaychecksDeleted,
              contributionsDeleted: this.contributionsDeleted,
            });
          } else {
            this.onSaveConfirm();
          }
        }
      },
      onSaveConfirm() {
        this.$store.dispatch('editGoal', {
          goal: this.goal,
          contributions: this.contributions,
          contributionPaychecksDeleted: this.contributionPaychecksDeleted,
          contributionsDeleted: this.contributionsDeleted,
        });
        this.$emit('close');
        return;
      },
      onSaveContribution(contribution) {
        for(let i in this.contributions) {
          if(moment(contribution.start_on).isBefore(this.contributions[i].start_on, 'month')) {
            this.contributions.splice(i, 0, contribution);
            return;
          }
        }
        this.contributions.push(contribution);
      },
      onDelete(goal) {
        EventBus.$emit('delete-goal', {
          goal: goal,
          contributionsDeleted: this.contributionsDeleted,
        });
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
      getContributionTotal(contribution) {
        return Number(contribution.amount)*contribution.diff;
      },
      getContributionPaycheckPaidTotal(contribution) {
        if(!contribution.hasOwnProperty('id')) {
          return 0;
        }
        let total = 0;
        this.goalContributionPaychecks.forEach((contribution_paycheck) => {
          if(contribution_paycheck.contribution_id === contribution.id && contribution_paycheck.paid_on !== null) {
            if(this.contributionPaychecksDeleted.find((contributionPaycheck) => {
              return contributionPaycheck.paycheck_id === contribution_paycheck.paycheck_id && contributionPaycheck.contribution_id === contribution_paycheck.contribution_id;
            }) === undefined) {
              total += Number(otherIfNull(contribution_paycheck, 'amount', 'amount_project'));
            }
          }
        });
        return total;
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
      goalContributions() {
        return this.$store.getters.getContributions.filter((contribution) => {
          return contribution.goal_id === this.goal.id;
        });
      },
      goalContributionIds() {
        return this.goalContributions.map((contribution) => {
          return contribution.id;
        });
      },
      contributionPaychecks() {
        return this.$store.getters.getContributionPaychecks;
      },
      goalContributionPaychecks() {
        return this.contributionPaychecks.filter((contributionPaycheck) => {
          return this.goalContributionIds.includes(contributionPaycheck.contribution_id);
        });
      },
      goalAmount() {
        if(this.goal.amount === '' || this.goal.amount === null) {
          return 0;
        }
        return Number(this.goal.amount);
      },
      goalInitialAmount() {
        if(this.goal.initial_amount === '' || this.goal.initial_amount === null) {
          return 0;
        }
        return Number(this.goal.initial_amount);
      },
      contributionsTotal() {
        let total = 0;
        this.contributions.forEach((contribution) => {
          total += Number(contribution.amount)*contribution.diff;
        });
        return total;
      },
      paychecksPaidTotal() {
        let total = 0;
        this.contributions.forEach((contribution) => {
          total += this.getContributionPaycheckPaidTotal(contribution);
        });
        return total;
      },
    },
  };
</script>
