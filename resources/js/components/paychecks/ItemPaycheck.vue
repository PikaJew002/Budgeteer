<template>
  <div class="card-body">
    <template v-if="!billsAndContributionsMode">
      <div class="d-flex justify-content-between">
        <h5>{{ income.name }}</h5>
        <h5>{{ dateToFormatedString(paycheck.paid_on) }}</h5>
      </div>
      <div class="d-flex justify-content-between mb-2">
        <h5>${{ amountProjectedIfAmountNull(paycheck) }}</h5>
        <h5>${{ leftOver }}</h5>
      </div>
      <div v-if="highlight && !receivingPair" class="d-flex justify-content-between mt-2">
        <button v-if="billPaychecks.length > 0 || contributionPaychecks.length > 0"
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
      <div v-for="billPaycheck in billPaychecks" class="d-flex justify-content-between mb-2">
        <span>
          {{ getBill(billPaycheck.bill_id).name }}
        </span>
        <span>
          {{ dateToFormatedString(billPaycheck.due_on, "MMM") }}
        </span>
        <span>
          ${{ amountProjectedIfAmountNull(billPaycheck) }}
        </span>
        <button type="button"
                class="btn btn-outline-base btn-sm"
                @click="onPairUpdateBill(getBill(billPaycheck.bill_id))">Update</button>
      </div>
      <div v-for="contributionPaycheck in contributionPaychecks" class="d-flex justify-content-between mb-2">
        <span>
          {{ getGoal(getContribution(contributionPaycheck.contribution_id).goal_id).name }}
        </span>
        <span>
          {{ dateToFormatedString(contributionPaycheck.due_on, "MMM") }}
        </span>
        <span>
          ${{ amountProjectedIfAmountNull(contributionPaycheck) }}
        </span>
        <button type="button"
                class="btn btn-outline-base btn-sm"
                @click="onPairUpdateContribution(getContribution(contributionPaycheck.contribution_id))">Update</button>
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
  import { numberToString, otherIfNull, dateToFormatedString } from '../../utils/main.js';
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
      EventBus.$on('paycheck-pairable-pair-start',  ({ pairable, month, type}) => {
        this.receivingPair = true;
        this.$emit('paycheck-stay-highlighted', [true, 'paycheck']);
      });
      EventBus.$on('paycheck-pair-start', obj => {
        if(obj.id == this.paycheck.id) {
          this.canStopPair = true;
        }
      });
      EventBus.$on('paycheck-pair-end', (paycheck) => {
        this.receivingPair = false;
        this.$emit('paycheck-stay-highlighted', [false, 'paycheck']);
      });
      EventBus.$on('paycheck-pairable-pair-end', ({ pairable, month, type }) => {
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
        EventBus.$emit('pair-update', { pairable: bill, paycheck: this.paycheck, type: 'bill' });
      },
      onPairUpdateContribution(contribution) {
        EventBus.$emit('pair-update', { pairable: contribution, paycheck: this.paycheck, type: 'contribution' });
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
        EventBus.$emit('paycheck-pairable-pair-end', { type: null });
      },
      dateToFormatedString(date, format) {
        return dateToFormatedString(date, format);
      },
      amountProjectedIfAmountNull(obj) {
        return numberToString(otherIfNull(obj, 'amount', 'amount_project'));
      },
      getGoal(goal_id) {
        return this.$store.getters.getGoal(goal_id);
      },
      getContribution(contribution_id) {
        return this.$store.getters.getContribution(contribution_id);
      },
      getBill(bill_id) {
        return this.$store.getters.getBill(bill_id);
      },
    },
    computed: {
      income() {
        return this.$store.getters.getIncome(this.paycheck.income_id) || {};
      },
      // ContributionPaychecks where paycheck_id is Paycheck.id
      contributionPaychecks() {
        return this.$store.getters.getContributionPaychecks.filter((contributionPaycheck) => {
          return contributionPaycheck.paycheck_id == this.paycheck.id;
        });
      },
      // BillPaychecks where paycheck_id is Paycheck.id
      billPaychecks() {
        return this.$store.getters.getBillPaychecks.filter((billPaycheck) => {
          return billPaycheck.paycheck_id == this.paycheck.id;
        });
      },
      leftOver() {
        let total = Number(otherIfNull(this.paycheck, 'amount', 'amount_project'));
        this.billPaychecks.forEach((billPaycheck) => {
          total -= Number(otherIfNull(billPaycheck, 'amount', 'amount_project'));
        });
        this.contributionPaychecks.forEach((contributionPaycheck) => {
          total -= Number(otherIfNull(contributionPaycheck, 'amount', 'amount_project'));
        });
        return total.toFixed(2);
      },
    },
  }
</script>
