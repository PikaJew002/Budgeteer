<template>
  <div id="delete-contribution">
    <b-modal v-model="showModal" ref="delete-contribution-modal" id="delete-contribution-modal" title="Delete Contribution" centered no-close-on-backdrop header-bg-variant="danger" header-text-variant="white">
      Are you sure you want to delete this contribution? <br>
      <template v-if="contributionPaychecks.length > 0">
        Caution! The following contribution-paycheck pairs will be removed!
        <ul>
          <li v-for="contributionPaycheck in contributionPaychecks" :key="contributionPaycheck.paycheck_id + '_' + contributionPaycheck.contribution_id">
            {{ getIncome(getPaycheck(contributionPaycheck.paycheck_id)).name }} - ${{ amountProjectIfAmountNull(getPaycheck(contributionPaycheck.paycheck_id)) }} - {{ paidOnFormat(getPaycheck(contributionPaycheck.paycheck_id).paid_on) }}
          </li>
        </ul>
      </template>
      <template slot="modal-footer">
        <b-button size="sm" variant="danger" @click="onDelete(contribution)">
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
  import moment from 'moment';
  
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
        contribution: {
          id: null,
        },
      };
    },
    created() {
      this.$eventBus.on('delete-contribution', (id) => {
        this.contribution.id = id;
        this.showModal = true;
      });
    },
    beforeDestroy() {
      this.$eventBus.off('delete-contribution');
    },
    methods: {
      onDelete(contribution) {
        this.$store.dispatch('deleteContribution', contribution);
        this.$emit('close');
      },
      getIncome(paycheck) {
        return this.incomes.find((income) => {
          return income.id === paycheck.income_id;
        }) || {};
      },
      getPaycheck(paycheck_id) {
        return this.$store.getters.getPaycheck(paycheck_id);
      },
      amountProjectIfAmountNull(paycheck) {
        return otherIfNull(paycheck, 'amount', 'amount_project');
      },
      paidOnFormat(paycheck) {
        return moment(paycheck.paid_on).format('ddd, MMM D');
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
      contributionPaychecks() {
        return this.$store.getters.getContributionPaychecks.filter((contributionPaycheck) => {
          return contributionPaycheck.contribution_id === this.contribution.id;
        });
      },
      incomes() {
        return this.$store.getters.getIncomes;
      },
    },
  }
</script>
