<template>
  <div id="save-modify-contribution-confirm">
    <b-modal v-model="showModal" ref="save-modify-contribution-confirm-modal" id="save-modify-contribution-confirm-modal" title="Confirm Edit Contribution" centered no-close-on-backdrop header-bg-variant="danger" header-text-variant="white">
      Are you sure you want to edit this contribution? <br>
        Caution! The following paychecks will be removed due to changes made to Start On and End On.
        <ul v-if="paychecksToRemove.length > 0">
          <li v-for="paycheck in paychecksToRemove">
            {{ getIncome(paycheck).name }} - ${{ paycheck.amount == null ? paycheck.amount_project : paycheck.amount }} - {{ paidOnFormat(paycheck.paid_on) }} <br>
          </li>
        </ul>
        These paycheck pairings will be deleted when/if the goal is saved (another confirmation will be displayed).
      <template slot="modal-footer">
        <b-button size="sm" variant="danger" @click="onConfirm(contribution)">
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
  import moment from 'moment';
  import { EventBus } from '../../event-bus.js';
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
        index: null,
        contribution: {
          id: null,
          amount: null,
          day_due_on: null,
          start_on: null,
          end_on: null,
        },
        paychecksToRemove: [],
      };
    },
    created() {
      EventBus.$on('save-modify-contribution-confirm', (data) => {
        this.index = data.index;
        this.contribution.id = data.contribution.id;
        this.contribution.amount = data.contribution.amount;
        this.contribution.day_due_on = data.contribution.day_due_on;
        this.contribution.start_on = data.contribution.start_on;
        this.contribution.end_on = data.contribution.end_on;
        this.paychecksToRemove = [];
        for(let i in data.paychecksToRemove) {
          this.paychecksToRemove.push(cloneDeep(data.paychecksToRemove[i]));
        }
        this.showModal = true;
      });
    },
    beforeDestroy() {
      EventBus.$off('save-modify-contribution-confirm');
    },
    methods: {
      onConfirm() {
        EventBus.$emit('save-modify-contribution-confirm-save', {
          index: this.index,
          contribution: this.contribution,
          paychecksToRemove: this.paychecksToRemove,
        });
        this.$emit('close');
      },
      getIncome(paycheck) {
        for(let i in this.incomes) {
          if(this.incomes[i].id == paycheck.income_id) {
            return this.incomes[i];
          }
        }
        return {};
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
      incomes() {
        return this.$store.getters.getIncomes;
      },
    },
  }
</script>
