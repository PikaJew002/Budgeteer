<template>
  <div id="modify-goal-confirm">
    <b-modal v-model="showModal" ref="modify-goal-confirm-modal" id="modify-goal-confirm-modal" title="Edit Goal Confirmation" centered no-close-on-backdrop header-bg-variant="danger" header-text-variant="white">
      Are you sure you want to edit the {{ goal.name }} goal? <br>
      Caution! The following contribution-paycheck pairings will be removed due to changes in the contributions. <br>
      <ul>
        <li v-for="contributionPaycheck in contributionPaychecksDeleted" :key="contributionPaycheck.contribution_id + '_' + contributionPaycheck.paycheck_id">
          {{ getIncome(getPaycheck(contributionPaycheck.paycheck_id)).name }} - ${{ amountProjectIfAmountNull(getPaycheck(contributionPaycheck.paycheck_id)) }} - {{ paidOnFormat(getPaycheck(contributionPaycheck.paycheck_id).paid_on) }}
        </li>
      </ul>
      <template slot="modal-footer">
        <b-button size="sm" variant="danger" @click="onSave(goal)">
          Confirm Save
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
        contributionsDeleted: [],
        contributionPaychecksDeleted: [],
      };
    },
    created() {
      EventBus.$on('save-modify-goal', data => {
        this.goal.id = data.goal.id;
        this.goal.name = data.goal.name;
        this.goal.amount = data.goal.amount;
        this.goal.initial_amount = data.goal.initial_amount;
        this.contributionsDeleted = cloneDeep(data.contributionsDeleted);
        this.contributionPaychecksDeleted = cloneDeep(data.contributionPaychecksDeleted);
        this.showModal = true;
      });
    },
    beforeDestory() {
      EventBus.$off('save-modify-goal');
    },
    methods: {
      onSave() {
        EventBus.$emit('save-modify-goal-confirm');
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
      incomes() {
        return this.$store.getters.getIncomes;
      },
      paychecks() {
        return this.$store.getters.getPaychecks;
      },
      contributionPaychecks() {
        return this.$store.getters.getContributionPaychecks;
      },
      // goalContributionPaychecksDeleted() {
      //   let goalContributionPaychecks = [];
      //   this.contributionsDeleted.forEach((contribution) => {
      //     this.contributionPaychecks.forEach((contribution_paycheck) => {
      //       if(contribution.id === contribution_paycheck.contribution_id) {
      //         goalContributionPaychecks.push(contribution_paycheck);
      //       }
      //     });
      //   });
      //   return goalContributionPaychecks;
      // }
    },
  }
</script>
