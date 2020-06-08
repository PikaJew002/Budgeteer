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
              <button class="btn btn-outline-sub1 btn-sm" @click="onDeleteContribution(index)">Delete</button>
            </div>
          </div>
          <hr v-if="goal.contributions.length > 0">
          <template v-if="goal.amount != null && goal.amount != ''">
            <span v-if="goal.contributions.length > 0 && (goal.initial_amount == null || goal.initial_amount == '') ">
              ${{ contributionsTotal }} / ${{ goal.amount }} = {{ ((Number(contributionsTotal) / Number(goal.amount))*100).toFixed(2) }}%
            </span>
            <span v-if="goal.contributions.length > 0 && (goal.initial_amount != null && goal.initial_amount != '') ">
              ${{ goal.initial_amount }} + ${{ contributionsTotal }} / ${{ goal.amount }} = {{ (((Number(contributionsTotal) + Number(goal.initial_amount)) / Number(goal.amount))*100).toFixed(2) }}%
            </span>
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
  import { BModal, BAlert, BButton } from 'bootstrap-vue';
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
        contributionsSpan: [],
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
            notZero: (amount) => ((amount == "" || amount == null) || (Number(amount) > 0)), // allows null and ""
          },
          initial_amount: {
            validDecimal,
            notZero: (amount) => ((amount == "" || amount == null) || (Number(amount) > 0)), // allows null and ""
          },
        },
      };
    },
    created() {
      EventBus.$on('modify-goal', obj => {
        this.goal.id = obj.id;
        this.goal.name = obj.name;
        this.goal.amount = obj.amount;
        this.goal.initial_amount = obj.initial_amount;
        this.contributionsSpan = [];
        this.goal.contributions = [];
        for(let i in obj.contributions) {
          let contribution = cloneDeep(obj.contributions[i]);
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
        if(this.goal.contributions.length > 0) {
          this.contributionsSpan.push(this.goal.contributions[0].start_on);
          this.contributionsSpan.push(this.goal.contributions[this.goal.contributions.length - 1].end_on);
        }
        this.showModal = true;
      });
      EventBus.$on('save-contribution', (arr) => {
        if(arr[0] == 'modify') {
          let contribution = arr[1];
          let checkStatus = this.checkOverLapAndAdd(contribution);
          if(checkStatus[0]) {
            this.goal.contributions.push(contribution);
            this.goal.contributions.sort(function(a, b) {
              return (moment(a.start_on).isBefore(b.start_on, 'month') ? -1 : 1);
            });
            EventBus.$emit('close-make-contribution');
          } else {
            EventBus.$emit('show-contribution-alert', ['danger', checkStatus[1], 15]);
          }
        }
      });
    },
    beforeDestroy() {
      EventBus.$off('modify-goal');
      EventBus.$off('save-contribution');
    },
    methods: {
      onAddContribution() {
        EventBus.$emit('make-contribution', 'modify');
      },
      onDeleteContribution(index) {
        if(this.goal.contributions.length == 1) {
          this.contributionsSpan = [];
        } else {
          if(this.contributionsSpan[0] == this.goal.contributions[index].start_on) {
            this.contributionsSpan[0] = this.goal.contributions[index + 1].start_on;
          } else if(this.contributionsSpan[1] == this.goal.contributions[index].end_on) {
            this.contributionsSpan[1] = this.goal.contributions[index - 1].end_on;
          }
        }
        this.goal.contributions.splice(index, 1);
      },
      onSave(goal) {
        if(!this.$v.goal.$invalid) {
          this.$store.dispatch('editGoal', goal);
          this.$emit('close');
        }
      },
      onDelete(goal) {
        EventBus.$emit('delete-goal', goal);
        this.$emit('close');
      },
      formatInitialAmount() {
        if(Number(this.goal.initial_amount).toFixed(2) != "NaN" && this.goal.initial_amount != "" && this.goal.initial_amount != null) {
          this.goal.initial_amount = Number(this.goal.initial_amount).toFixed(2);
        }
      },
      formatAmount() {
        if(Number(this.goal.amount).toFixed(2) != "NaN" && this.goal.amount != "" && this.goal.amount != null) {
          this.goal.amount = Number(this.goal.amount).toFixed(2);
        }
      },
      checkOverLapAndAdd(contribution) {
        if(this.contributionsSpan.length == 0) {
          this.contributionsSpan[0] = contribution.start_on;
          this.contributionsSpan[1] = contribution.end_on;
          return [true, ''];
        }
        if(this.contributionsSpan.length == 2) {
          if(moment(contribution.start_on).isBetween(this.contributionsSpan[0], this.contributionsSpan[1], 'month', "[]")) {
            return [false, '\'Start On\' overlaps with other scheduled contributions!'];
          }
          if(moment(contribution.end_on).isBetween(this.contributionsSpan[0], this.contributionsSpan[1], 'month', "[]")) {
            return [false, '\'End On\' overlaps with other scheduled contributions!'];
          }
          if(moment(contribution.start_on).isBefore(this.contributionsSpan[0], 'month') && moment(contribution.end_on).isBefore(this.contributionsSpan[0], 'month')) {
            // is before contributionsSpan, update lower boundry with contribution.start_on
            this.contributionsSpan[0] = contribution.start_on;
            return [true, ''];
          }
          if(moment(contribution.end_on).isAfter(this.contributionsSpan[1], 'month') && moment(contribution.start_on).isAfter(this.contributionsSpan[1], 'month')) {
            // is after contributionsSpan, update upper boundry with contribution.end_on
            this.contributionsSpan[1] = contribution.end_on;
            return [true, ''];
          }
        }
        return [false, 'Something went wrong... reload the page and try again.'];
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
      contributionsTotal() {
        let total = 0;
        for(let i in this.goal.contributions) {
          total += (Number(this.goal.contributions[i].amount)*this.goal.contributions[i].diff);
        }
        return total.toFixed(2);
      },
    },
  };
</script>
