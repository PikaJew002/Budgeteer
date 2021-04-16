<template>
  <div class="card-body">
    <div class="d-flex justify-content-between">
      <h5 class="card-title">
        {{ goal.name }}
      </h5>
      <h5 class="card-title">
        ${{ formatAmount(contributionPaychecks.length > 0 ? contributionPaychecks[0] : contribution)  }}
      </h5>
      <h5 v-if="contributionPaychecks.length > 0 && isAllPaid" class="card-title text-success">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52.917 52.917" height="26" width="26"><g fill="none" stroke="#28A745"><path d="M52.13 26.458A25.672 25.672 0 0126.458 52.13 25.672 25.672 0 01.786 26.458 25.672 25.672 0 0126.458.786 25.672 25.672 0 0152.13 26.458z" stroke-width="1.573"/><path stroke-width="1.605" d="M25.712 28.197L47.817 6.092l.674.674-22.105 22.105z"/><path stroke-width="1.605" d="M15.761 18.246l.682-.681 9.951 9.95-.681.682z"/></g></svg>
      </h5>
      <h5 v-else-if="contributionPaychecks.length > 0 && !isAllPaid" class="card-title text-primary">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52.917 52.917" height="26" width="26"><g fill="none" stroke="#007BFF"><path d="M52.13 26.458A25.672 25.672 0 0126.458 52.13 25.672 25.672 0 01.786 26.458 25.672 25.672 0 0126.458.786 25.672 25.672 0 0152.13 26.458z" stroke-width="1.573"/><path d="M26.309.744h.299v22.325h-.299z" stroke-width="1.487"/></g></svg>
      </h5>
      <h5 v-else class="card-title text-base">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52.917 52.917" height="26" width="26"><path d="M52.13 26.458A25.672 25.672 0 0126.458 52.13 25.672 25.672 0 01.786 26.458 25.672 25.672 0 0126.458.786 25.672 25.672 0 0152.13 26.458z" fill="none" stroke="#1D4880" stroke-width="1.573"/></svg>
      </h5>
    </div>
    <div class="d-flex justify-content-between">
      <small v-if="contributionPaychecks.length > 0" class="text-muted">
        <template v-for="contributionPaycheck in contributionPaychecks">
          {{ isPaid(contributionPaycheck) ? "Paid" : "Scheduled" }} on
          <span :key="amountProjectIfAmountNull(contributionPaycheck)">
            {{ formatedDate(contributionPaycheck.paid_on === null ? getPaycheck(contributionPaycheck.paycheck_id).paid_on : contributionPaycheck.paid_on) }}
          </span>
        </template>
      </small>
      <small v-else class="text-muted">
        Due on {{ contributionDueOn }}
      </small>
    </div>
    <div v-if="highlight && !receivingPair" class="text-center mt-2">
      <button v-if="contributionPaychecks.length > 0"
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

<script>
  import { EventBus } from '../../event-bus.js';
  import { numberToString, dateToString, otherIfNull, dateToFormatedString } from '../../utils/main.js';
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
        EventBus.$emit('pair-update', { pairable: this.contribution, paycheck: this.getPaycheck(this.contributionPaychecks[0].paycheck_id), type: 'contribution' });
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
      getPaycheck(id) {
        return this.$store.getters.getPaycheck(id) || { paid_on: null };
      },
      isPaid(contribution_paycheck) {
        return contribution_paycheck.paid_on !== null;
      },
      formatAmount(obj) {
        return numberToString(otherIfNull(obj, 'amount', 'amount_project'));
      },
      amountProjectIfAmountNull(obj) {
        return otherIfNull(obj, 'amount', 'amount_project');
      },
      formatedDate(date) {
        return dateToFormatedString(date);
      },
    },
    computed: {
      goal() {
        return this.$store.getters.getGoal(this.contribution.goal_id) || { name: '' };
      },
      // ContributionPaychecks where contribution_id is Contribution.id
      contributionPaychecks() {
        return this.$store.getters.getContributionPaychecks.filter((contribution_paycheck) => {
          return contribution_paycheck.contribution_id === this.contribution.id;
        }).filter((contribution_paycheck) => {
          return contribution_paycheck.due_on.substr(0, 7) === dateToString(this.month[1], this.month[0]);
        });
      },
      contributionDueOn() {
        return dateToFormatedString(dateToString(this.month[1], this.month[0], this.contribution.day_due_on));
      },
      isAllPaid() {
        return this.contributionPaychecks.length > 0 ? this.contributionPaychecks.reduce((acc, contribution_paycheck) => {
          return acc && contribution_paycheck.paid_on !== null;
        }, true) : false;
      },
    },
  }
</script>
