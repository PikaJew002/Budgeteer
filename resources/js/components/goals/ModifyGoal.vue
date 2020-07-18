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
              <input class="form-control" :class="{ 'is-invalid': $v.goal.name.$invalid && !$v.goal.name.$pending,
                                                    'is-valid': !$v.goal.name.$invalid && !$v.goal.name.$pending }"
                     id="name" type="text" placeholder="Goal Name" v-model="goal.name">
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
                <input class="form-control" id="amount" type="text" placeholder="Amount"
                       v-model="goal.amount" @blur="formatAmount()"
                       :class="{ 'is-invalid': $v.goal.amount.$invalid && !$v.goal.amount.$pending,
                                 'is-valid': !$v.goal.amount.$invalid && !$v.goal.amount.$pending }">
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
                <input class="form-control" id="initial_amount" type="text" placeholder="Amount"
                       v-model="goal.initial_amount" @blur="formatInitialAmount()"
                       :class="{ 'is-invalid': $v.goal.initial_amount.$invalid && !$v.goal.initial_amount.$pending,
                                 'is-valid': !$v.goal.initial_amount.$invalid && !$v.goal.initial_amount.$pending }">
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
            <h6>Contributions</h6><button type="button" class="btn btn-outline-base" @click="onAddContribution()">+</button>
          </div>
          <hr v-if="goal.contributions.length > 0">
          <div class="d-flex flex-row flex-nowrap overflow-auto">
            <div v-for="(contribution, index) in goal.contributions"
                 :key="contribution.start_on"
                 class="card p-3 mx-2 my-0 border border-base rounded-sm"
                 style="min-width: 100px;">
              <h6 class="card-title">{{ contribution.monthSpan[0] + (contribution.monthSpan.length > 1 ? " - " + contribution.monthSpan[1] : "") }}</h6>
              <h6 v-if="contribution.diff > 1" class="card-subtitle mb-2 text-muted">${{ contribution.amount }} x {{ contribution.diff }} months = ${{ (contribution.diff*Number(contribution.amount)).toFixed(2) }}</h6>
              <h6 v-else class="card-subtitle mb-2 text-muted">${{ contribution.amount }} x 1 month</h6>
              <button class="btn btn-outline-sub1 btn-sm" @click.prevent="onEditContribution(index)">Edit</button>
              <button class="btn btn-outline-sub1 btn-sm" @click.prevent="onDeleteContribution(index)">Delete</button>
            </div>
          </div>
          <hr v-if="goal.contributions.length > 0">
          <template v-if="goalAmount > 0 && (contributionsTotal > 0 || goalInitialAmount > 0)">
            <b-progress :max="goalAmount" height="2rem" class="mb-1">
              <b-progress-bar :value="goal.initial_amount" v-if="goalInitialAmount > 0"></b-progress-bar>
              <template v-for="(contribution, index) in goal.contributions">
                <b-progress-bar :value="getContributionPaycheckPaidTotal(contribution)" striped :variant="legend_key[index % 6]"></b-progress-bar>
                <b-progress-bar :value="getContributionTotal(contribution) - getContributionPaycheckPaidTotal(contribution)" :variant="legend_key[index % 6]"></b-progress-bar>
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
            <template v-for="(contribution, index) in goal.contributions">
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
            </template>
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
          contributions: [],
        },
        contributionsDeleted: [],
        paychecksDeleted: [],
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
        this.goal.contributions = [];
        for(let i in goal.contributions) {
          let contribution = cloneDeep(goal.contributions[i]);
          if(moment(contribution.start_on).isSame(contribution.end_on, 'month')) {
            contribution.monthSpan = [moment(contribution.start_on).format('MMM YYYY')];
          } else {
            contribution.monthSpan = [moment(contribution.start_on).format('MMM YYYY'), moment(contribution.end_on).format('MMM YYYY')]
          }
          contribution.diff = Math.ceil(moment(contribution.end_on).diff(contribution.start_on, 'months', true))
          this.goal.contributions.push(contribution);
        }
        this.goal.contributions.sort(function(a, b) {
          return (moment(a.start_on).isBefore(b.start_on, 'month') ? -1 : 1);
        });
        this.contributionsDeleted = [];
        this.paychecksDeleted = [];
        this.showModal = true;
      });
      EventBus.$on('delete-goal-confirm', () => {
        this.$emit('close');
      });
      EventBus.$on('delete-contribution-confirm', (data) => {
        this.contributionsDeleted.push(data.contribution);
        this.goal.contributions.splice(data.index, 1);
      });
      EventBus.$on('save-make-contribution', (data) => {
        if(data.type != 'modify-goal') {
          return;
        }
        if(data.contribution.goal_id == null) {
          data.contribution.goal_id = this.goal.id;
        }
        this.onSaveContribution(data.contribution);
      });
      EventBus.$on('save-modify-contribution', (data) => {
        if(data.type != 'modify-goal') {
          return;
        }
        for(let i in data.paychecksToRemove) {
          this.paychecksDeleted.push(data.paychecksToRemove[i]);
        }
        this.goal.contributions.splice(data.index, 1);
        this.onSaveContribution(data.contribution);
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
          contributions: this.goal.contributions,
        });
      },
      onDeleteContribution(index) {
        if(this.goal.contributions[index].hasOwnProperty('paychecks') && this.goal.contributions[index].paychecks.length > 0) {
          EventBus.$emit('delete-contribution', {
            index: index,
            contribution: this.goal.contributions[index],
          });
        } else {
          if(this.goal.contributions[index].hasOwnProperty('id')) {
            this.contributionsDeleted.push(this.goal.contributions[index]);
          }
          this.goal.contributions.splice(index, 1);
        }
      },
      onEditContribution(index) {
        EventBus.$emit('modify-contribution', {
          type: 'modify-goal',
          contributions: this.goal.contributions,
          index: index,
          paychecks: this.paychecksDeleted,
        });
      },
      onSave(goal) {
        if(!this.$v.goal.$invalid) {
          if(this.contributionsDeleted.length > 0) {
            for(let i in this.contributionsDeleted) {
              if(this.contributionsDeleted[i].hasOwnProperty('paychecks') && this.contributionsDeleted[i].paychecks.length > 0) {
                EventBus.$emit('save-modify-goal', {
                  goal: this.goal,
                  paychecksDeleted: this.paychecksDeleted,
                  contributionsDeleted: this.contributionsDeleted,
                });
                return;
              }
            }
          }
          if(this.paychecksDeleted.length > 0) {
            EventBus.$emit('save-modify-goal', {
              goal: this.goal,
              paychecksDeleted: this.paychecksDeleted,
              contributionsDeleted: this.contributionsDeleted,
            });
            return;
          }
          this.onSaveConfirm();
        }
      },
      onSaveConfirm() {
        this.$store.dispatch('editGoal', {
          goal: this.goal,
          paychecksDeleted: this.paychecksDeleted,
          contributionsDeleted: this.contributionsDeleted,
        });
        this.$emit('close');
        return;
      },
      onSaveContribution(contribution) {
        for(let i in this.goal.contributions) {
          if(moment(contribution.start_on).isBefore(this.goal.contributions[i].start_on, 'month')) {
            this.goal.contributions.splice(i, 0, contribution);
            return;
          }
        }
        this.goal.contributions.push(contribution);
      },
      onDelete(goal) {
        EventBus.$emit('delete-goal', {
          goal: goal,
          contributionsDeleted: this.contributionsDeleted,
        });
      },
      formatInitialAmount() {
        if(Number(this.goal.initial_amount).toFixed(2) != "NaN" && this.goal.initial_amount != '' && this.goal.initial_amount != null) {
          this.goal.initial_amount = Number(this.goal.initial_amount).toFixed(2);
        }
      },
      formatAmount() {
        if(Number(this.goal.amount).toFixed(2) != "NaN" && this.goal.amount != '' && this.goal.amount != null) {
          this.goal.amount = Number(this.goal.amount).toFixed(2);
        }
      },
      getContributionTotal(contribution) {
        return Number(contribution.amount)*contribution.diff;
      },
      getContributionPaycheckPaidTotal(contribution) {
        if(!contribution.hasOwnProperty('paychecks')) {
          return 0;
        }
        let total = 0;
        for(let i in contribution.paychecks) {
          if(contribution.paychecks[i].contribution_paid_on != null) {
            total += (contribution.paychecks[i].contribution_amount == null ? contribution.paychecks[i].contribution_amount_project : contribution.paychecks[i].contribution_amount);
          }
        }
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
      goalAmount() {
        if(this.goal.amount == '' || this.goal.amount == null) {
          return 0;
        }
        return Number(this.goal.amount);
      },
      goalInitialAmount() {
        if(this.goal.initial_amount == '' || this.goal.initial_amount == null) {
          return 0;
        }
        return Number(this.goal.initial_amount);
      },
      contributionsTotal() {
        let total = 0;
        for(let i in this.goal.contributions) {
          total += Number(this.goal.contributions[i].amount)*this.goal.contributions[i].diff;
        }
        return total;
      },
      paychecksPaidTotal() {
        let total = 0;
        for(let i in this.goal.contributions) {
          if(!this.goal.contributions[i].hasOwnProperty('paychecks')) {
            continue;
          }
          for(let j in this.goal.contributions[i].paychecks) {
            if(this.goal.contributions[i].paychecks[j].contribution_paid_on != null) {
              total += (this.goal.contributions[i].paychecks[j].contribution_amount == null ? this.goal.contributions[i].paychecks[j].contribution_amount_project : this.goal.contributions[i].paychecks[j].contribution_amount);
            }
          }
        }
        return total;
      },
    },
  };
</script>
