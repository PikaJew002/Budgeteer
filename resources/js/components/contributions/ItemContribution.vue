<template>
  <div class="card-body">
    <template v-if="(paycheck.contribution_amount || paycheck.contribution_amount_project) && (paycheck.contribution_paid_on == null)">
      <div class="d-flex justify-content-between">
        <h5 class="card-title">
          {{ goal.name }}
        </h5>
        <h5 class="card-title">
          ${{ paycheck_contribution_amount_to_string }}
        </h5>
        <h5 class="card-title text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52.917 52.917" height="26" width="26"><g fill="none" stroke="#007BFF"><path d="M52.13 26.458A25.672 25.672 0 0126.458 52.13 25.672 25.672 0 01.786 26.458 25.672 25.672 0 0126.458.786 25.672 25.672 0 0152.13 26.458z" stroke-width="1.573"/><path d="M26.309.744h.299v22.325h-.299z" stroke-width="1.487"/></g></svg>
        </h5>
      </div>
      <div class="d-flex justify-content-between">
        <small class="text-muted">Scheduled on {{ paycheck_paid_on }}</small>
      </div>
    </template>
    <template v-else-if="(paycheck.contribution_amount || paycheck.contribution_amount_project) && (paycheck.contribution_paid_on != null)">
      <div class="d-flex justify-content-between">
        <h5 class="card-title">
          {{ goal.name }}
        </h5>
        <h5 class="card-title">
          ${{ paycheck_contribution_amount_to_string }}
        </h5>
        <h5 class="card-title text-success">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52.917 52.917" height="26" width="26"><g fill="none" stroke="#28A745"><path d="M52.13 26.458A25.672 25.672 0 0126.458 52.13 25.672 25.672 0 01.786 26.458 25.672 25.672 0 0126.458.786 25.672 25.672 0 0152.13 26.458z" stroke-width="1.573"/><path stroke-width="1.605" d="M25.712 28.197L47.817 6.092l.674.674-22.105 22.105z"/><path stroke-width="1.605" d="M15.761 18.246l.682-.681 9.951 9.95-.681.682z"/></g></svg>
        </h5>
      </div>
      <div class="d-flex justify-content-between">
        <small class="text-muted">Paid on {{ paycheck_pivot_paid_on }}</small>
      </div>
    </template>
    <template v-else>
      <div class="d-flex justify-content-between">
        <h5 class="card-title">
          {{ goal.name }}
        </h5>
        <h5 class="card-title">
          ${{ contribution_amount_to_string }}
        </h5>
        <h5 class="card-title text-base">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52.917 52.917" height="26" width="26"><path d="M52.13 26.458A25.672 25.672 0 0126.458 52.13 25.672 25.672 0 01.786 26.458 25.672 25.672 0 0126.458.786 25.672 25.672 0 0152.13 26.458z" fill="none" stroke="#1D4880" stroke-width="1.573"/></svg>
        </h5>
      </div>
      <div class="d-flex justify-content-between">
        <small class="text-muted">Due on {{ contribution_day_due_on }}</small>
      </div>
    </template>
    <div v-if="highlight && !receivingPair" class="text-center mt-2">
      <button v-if="paycheck.hasOwnProperty('id')"
              type="button"
              class="btn btn-outline-base btn-sm"
              @click="onPairUpdate()">Update</button>
      <button v-else
              type="button"
              class="btn btn-outline-base btn-sm"
              @click="onPair()">Pair</button>
    </div>
    <div v-if="receivingPair && !canStopPair" class="text-center mt-2">
      <button type="button"
              class="btn btn-outline-base btn-sm"
              @click="onPair()">Pair</button>
    </div>
    <div v-if="canStopPair" class="text-center mt-2">
      <button type="button"
              class="btn btn-outline-base btn-sm"
              @click="onStopPair()">Stop Pair</button>
    </div>
  </div>
</template>

<style>
  .elips {
    transform: rotate(-90deg);
  }
  .elips:after {
    content: '\2807';
    font-size: 15px;
  }
</style>

<script>
  import { EventBus } from '../../event-bus.js';
  import moment from 'moment';
  export default {
    props: {
      contribution: {
        type: Object,
        required: true,
      },
      highlight: {
        type: Boolean,
        required: true,
      },
      month: {
        type: Array,
        required: true,
      },
      open: {
        type: Boolean,
        default: false,
      },
      remove: {
        type: Boolean,
        default: false,
      },
      edit: {
        type: Boolean,
        default: false,
      },
    },
    created() {
      EventBus.$on('paycheck-pair-start', obj => {
        this.receivingPair = true;
        this.$emit('contribution-stay-highlighted', [true, 'contribution']);
      });
      EventBus.$on('paycheck-pairable-pair-start', arr => {
        if(arr[2] === 'contribution' && arr[0].id == this.contribution.id && this.month[0] == arr[1][0] && this.month[1] == arr[1][1]) {
          this.canStopPair = true;
        }
      });
      EventBus.$on('paycheck-pairable-pair-end', obj => {
        this.receivingPair = false;
        this.$emit('contribution-stay-highlighted', [false, 'contribution']);
      });
      EventBus.$on('paycheck-pair-end', obj => {
        if(this.receivingPair) {
          this.receivingPair = false;
          this.canStopPair = false;
          this.$emit('contribution-stay-highlighted', [false, 'contribution']);
        }
      });
    },
    data() {
      return {
        receivingPair: false,
        canStopPair: false,
      };
    },
    methods: {
      onPairUpdate() {
        EventBus.$emit('pair-update', [this.contribution, this.paycheck, 'paycheck', 'contribution']);
      },
      onPair() {
        if(!this.receivingPair) {
          // case: the contribution is selected first
          this.receivingPair = true;
          this.$emit('contribution-stay-highlighted', [true, 'contribution']);
          EventBus.$emit('paycheck-pairable-pair-start', [this.contribution, this.month, 'contribution']);
        } else {
          EventBus.$emit('paycheck-pairable-pair-end', [this.contribution, this.month, 'contribution']);
        }
      },
      onStopPair() {
        this.canStopPair = false;
        EventBus.$emit('paycheck-pair-end', null);
      },
      amount_to_string(amount) {
        if(Number(amount).toFixed(2) != "NaN" && amount != "" && amount != null) {
          return Number(amount).toFixed(2);
        }
        return "";
      },
    },
    computed: {
      goals() {
        return this.$store.getters.getGoals;
      },
      goal() {
        for(let i in this.goals) {
          if(this.goals[i].id == this.contribution.goal_id) {
            return this.goals[i];
          }
        }
        return {};
      },
      thisMonth() {
        let monthStr = "" + this.month[1] + "-" + (this.month[0] > 9 ? this.month[0] : "0" + this.month[0]);
        return monthStr;
      },
      paycheck() {
        for(let i in this.contribution.paychecks) {
          if(this.month[1] + "-" + (this.month[0] > 9 ? this.month[0] : "0" + this.month[0]) == this.contribution.paychecks[i].contribution_due_on.substr(0, 7)) return this.contribution.paychecks[i];
        }
        return {};
      },
      paycheck_paid_on() {
        return moment(this.paycheck.paid_on).format('ddd, MMM D');
      },
      paycheck_pivot_paid_on() {
        return moment(this.paycheck.contribution_paid_on).format('ddd, MMM D');
      },
      contribution_day_due_on() {
        return moment([this.month[1], this.month[0] - 1, (this.contribution.day_due_on == null ? "01" : this.contribution.day_due_on) ]).format('ddd, MMM D');
      },
      paycheck_contribution_amount_to_string() {
        return (this.paycheck.contribution_amount == null ? this.amount_to_string(this.paycheck.contribution_amount_project) : this.amount_to_string(this.paycheck.contribution_amount));
      },
      contribution_amount_to_string() {
        return this.amount_to_string(this.contribution.amount);
      },
    },
  }
</script>
