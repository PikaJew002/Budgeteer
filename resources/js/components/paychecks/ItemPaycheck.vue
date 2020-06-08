<template>
  <div class="card-body">
    <template v-if="!billsAndContributionsMode">
      <div class="d-flex justify-content-between">
        <h5>{{ income.name }}</h5>
        <h5>{{ paycheck_paid_on }}</h5>
      </div>
      <div class="d-flex justify-content-between mb-2">
        <h5>${{ paycheck.amount == null ? paycheck.amount_project : paycheck.amount }}</h5>
        <h5>${{ leftOver }}</h5>
      </div>
      <div v-if="highlight && !receivingPair" class="d-flex justify-content-between mt-2">
        <button v-if="paycheck.bills.length > 0 || paycheck.contributions.length > 0"
                type="button"
                class="btn btn-outline-base btn-sm"
                @click="billsAndContributionsMode = true">Bills/Contributions</button>
        <button v-else
                type="button"
                class="btn btn-outline-base btn-sm"
                @click="onPair()">Pair</button>
        <button class="btn btn-outline-sub1 btn-sm" @click="onModify()">Edit</button>
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
    </template>
    <template v-else>
      <div v-for="bill in paycheck.bills" class="d-flex justify-content-between mb-2">
        <span>
          {{ bill.name }}
        </span>
        <span>
          {{ getMonthShort(bill.pivot_due_on) }}
        </span>
        <span>
          {{ " $" + (bill.pivot_amount ? bill.pivot_amount : bill.pivot_amount_project) }}
        </span>
        <button type="button"
                class="btn btn-outline-base btn-sm"
                @click="onPairUpdateBill(bill)">Update</button>
      </div>
      <div v-for="contribution in paycheck.contributions" class="d-flex justify-content-between mb-2">
        <span>
          {{ getContributionGoal(contribution).name }}
        </span>
        <span>
          {{ getMonthShort(contribution.pivot_due_on) }}
        </span>
        <span>
          {{ " $" + (contribution.pivot_amount ? contribution.pivot_amount : contribution.pivot_amount_project) }}
        </span>
        <button type="button"
                class="btn btn-outline-base btn-sm"
                @click="onPairUpdateContribution(contribution)">Update</button>
      </div>
      <div v-if="highlight && !receivingPair" class="d-flex justify-content-between mt-2">
        <button type="button" class="btn btn-outline-base btn-sm" @click="billsAndContributionsMode = false">Paycheck</button>
        <button type="button" class="btn btn-outline-base btn-sm" @click="onPair()">Pair</button>
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
    </template>
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
      paycheck: {
        type: Object,
        required: true,
      },
      highlight: {
        type: Boolean,
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
      EventBus.$on('paycheck-pairable-pair-start', arr => {
        this.receivingPair = true;
        this.$emit('paycheck-stay-highlighted', [true, 'paycheck']);
      });
      EventBus.$on('paycheck-pair-start', obj => {
        if(obj.id == this.paycheck.id) {
          this.canStopPair = true;
        }
      });
      EventBus.$on('paycheck-pair-end', obj => {
        this.receivingPair = false;
        this.$emit('paycheck-stay-highlighted', [false, 'paycheck']);
      });
      EventBus.$on('paycheck-pairable-pair-end', arr => {
        if(this.receivingPair) {
          this.receivingPair = false;
          this.canStopPair = false;
          this.$emit('paycheck-stay-highlighted', [false, 'paycheck']);
          this.billsAndContributionsMode = false;
        }
      })
    },
    data() {
      return {
        receivingPair: false,
        canStopPair: false,
        billsAndContributionsMode: false,
      };
    },
    methods: {
      onModify() {
        EventBus.$emit('modify-paycheck', this.paycheck);
      },
      onPairUpdateBill(bill) {
        EventBus.$emit('pair-update', [bill, this.paycheck, 'bill', 'bill']);
      },
      onPairUpdateContribution(contribution) {
        EventBus.$emit('pair-update', [contribution, this.paycheck, 'contribution', 'contribution']);
      },
      onPair() {
        if(!this.receivingPair) {
          // case: the paycheck is selected first
          this.receivingPair = true;
          this.$emit('paycheck-stay-highlighted', [true, 'paycheck']);
          EventBus.$emit('paycheck-pair-start', this.paycheck);
        } else {
          // case: the paycheck is selected last
          EventBus.$emit('paycheck-pair-end', this.paycheck);
        }
      },
      onStopPair() {
        this.canStopPair = false;
        EventBus.$emit('paycheck-pairable-pair-end', null);
      },
      getMonthShort(date) {
        return moment(date).format('MMM');
      },
      getContributionGoal(contribution) {
        for(let i in this.goals) {
          if(this.goals[i].id == contribution.goal_id) {
            return this.goals[i];
          }
        }
      },
      moment(args) {
        return moment(args);
      },
    },
    computed: {
      leftOver() {
        let total = ((this.paycheck.amount == null || this.paycheck.amount == 0) ? this.paycheck.amount_project : this.paycheck.amount);
        for(let i in this.paycheck.bills) {
          total = total - (this.paycheck.bills[i].pivot_amount == null ? this.paycheck.bills[i].pivot_amount_project : this.paycheck.bills[i].pivot_amount);
        }
        for(let i in this.paycheck.contributions) {
          total = total - (this.paycheck.contributions[i].pivot_amount == null ? this.paycheck.contributions[i].pivot_amount_project : this.paycheck.contributions[i].pivot_amount);
        }
        return Math.round(total * 100)/100;
      },
      paycheck_paid_on() {
        return moment(this.paycheck.paid_on).format('ddd, MMM D');
      },
      /**
        Gets the incomes
        */
      incomes() {
        return this.$store.getters.getIncomes;
      },
      income() {
        for(let i in this.incomes) {
          if(this.incomes[i].id == this.paycheck.income_id) return this.incomes[i];
        }
        return {};
      },
      goals() {
        return this.$store.getters.getGoals;
      },
    },
  }
</script>
