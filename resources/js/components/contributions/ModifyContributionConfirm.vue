<template>
  <div id="save-modify-contribution-confirm">
    <b-modal v-model="showModal" ref="save-modify-contribution-confirm-modal" id="save-modify-contribution-confirm-modal" title="Confirm Edit Contribution" centered no-close-on-backdrop header-bg-variant="danger" header-text-variant="white">
      Are you sure you want to save changes to this contribution? <br>
      Caution! The following contribution-paycheck pairs will be removed due to changes made to Start On and End On.
      <ul>
        <li v-for="contributionPaycheck in contributionPaychecksToRemove">
          {{ getIncomeFromPaycheckId(contributionPaycheck.paycheck_id).name }} - ${{ amountProjectIfAmountNull(contributionPaycheck.paycheck_id) }} - {{ paidOnFormat(contributionPaycheck.paycheck_id) }} <br>
        </li>
      </ul>
      <template slot="modal-footer">
        <b-button size="sm" variant="danger" @click="onConfirm(contributionPaychecksToRemove)">
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
        contributionPaychecksToRemove: [],
      };
    },
    created() {
      this.$eventBus.on('save-modify-contribution', (contributionPaychecksToRemove) => {
        this.contributionPaychecksToRemove = contributionPaychecksToRemove;
        this.showModal = true;
      });
    },
    beforeDestroy() {
      this.$eventBus.off('save-modify-contribution');
    },
    methods: {
      onConfirm(contributionPaychecksToRemove) {
        this.$eventBus.emit('save-modify-contribution-confirm', contributionPaychecksToRemove);
        this.$emit('close');
      },
      getIncomeFromPaycheckId(paycheck_id) {
        return this.$store.getters.getIncome(this.getPaycheck(paycheck_id).income_id) || {};
      },
      getPaycheck(paycheck_id) {
        return this.$store.getters.getPaycheck(paycheck_id) || {};
      },
      paidOnFormat(paycheck_id) {
        return dateToFormatedString(this.getPaycheck(paycheck_id).paid_on);
      },
      amountProjectIfAmountNull(paycheck_id) {
        return otherIfNull(this.getPaycheck(paycheck_id), 'amount', 'amount_project');
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
    },
  }
</script>
