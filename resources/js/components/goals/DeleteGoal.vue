<template>
  <div id="delete-goal">
    <b-modal v-model="showModal" ref="delete-goal-modal" id="delete-goal-modal" title="Delete Goal" centered no-close-on-backdrop header-bg-variant="danger" header-text-variant="white">
      Are you sure you want to delete the {{ goal.name }} goal? <br>
      <template v-if="goalContributions.length > 0">
        Caution! All contributions on this goal will be deleted as well. <br>
        <template v-if="goalContributionPaychecks.length > 0">
          The following paycheck-contribution pairings will also be deleted.
        </template>
        <ul v-if="goalContributionPaychecks.length > 0">
          <li v-for="goalContributionPaycheck in goalContributionPaychecks">
            {{ getIncome(getPaycheck(goalContributionPaycheck.paycheck_id)).name }} - ${{ amountProjectIfAmountNull(getPaycheck(goalContributionPaycheck.paycheck_id)) }} - {{ paidOnFormat(getPaycheck(goalContributionPaycheck.paycheck_id).paid_on) }}
          </li>
        </ul>
      </template>
      <template slot="modal-footer">
        <b-button size="sm" variant="danger" @click="onDelete(goal)">
          Delete
        </b-button>
        <b-button size="sm" variant="base" @click="$emit('close')">
          Cancel
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
  import { BModal, BButton } from 'bootstrap-vue';
  import { cloneDeep } from 'lodash';
  import { EventBus } from '../../event-bus.js';
  import { otherIfNull, dateToFormatedString } from '../../utils/main.js';
  export default {
    components: {
      'b-modal': BModal,
      'b-button': BButton,
    },
    props: {
      show: {
        type: Boolean,
        required: true,
      },
    },
    data() {
      return {
        goal: {
          id: null,
          name: "",
          amount: null,
          initial_amount: null,
        },
      };
    },
    created() {
      EventBus.$on('delete-goal', (goal) => {
        this.goal.id = goal.id;
        this.goal.name = goal.name;
        this.goal.amount = goal.amount;
        this.goal.initial_amount = goal.initial_amount;
        this.showModal = true;
      });
    },
    methods: {
      onDelete() {
        EventBus.$emit('delete-goal-confirm');
        this.$store.dispatch('deleteGoal', this.goal);
        this.$emit('close');
      },
      getIncome(paycheck) {
        return this.incomes.find((income) => {
          return income.id === paycheck.income_id;
        }) || {};
      },
      getPaycheck(paycheck_id) {
        return this.paychecks.find((paycheck) => {
          return paycheck.id === paycheck_id;
        }) || {};
      },
      amountProjectIfAmountNull(paycheck) {
        return otherIfNull(paycheck, 'amount', 'amount_project');
      },
      paidOnFormat(paycheck) {
        return dateToFormatedString(paycheck.paid_on);
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
      paychecks() {
        return this.$store.getters.getPaychecks;
      },
      incomes() {
        return this.$store.getters.getIncomes;
      },
      contributions() {
        return this.$store.getters.getContributions;
      },
      goalContributions() {
        return this.contributions.filter((contribution) => {
          return contribution.goal_id === this.goal.id;
        });
      },
      contributionPaychecks() {
        return this.$store.getters.getContributionPaychecks;
      },
      goalContributionPaychecks() {
        let goalContributionPaychecks = [];
        this.goalContributions.forEach((contribution) => {
          this.contributionPaychecks.forEach((contribution_paycheck) => {
            if(contribution.id === contribution_paycheck.contribution_id) {
              goalContributionPaychecks.push(contribution_paycheck);
            }
          });
        });
        return goalContributionPaychecks;
      },
    },
  }
</script>
