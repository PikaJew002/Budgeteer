<template>
  <div id="delete-contribution">
    <b-modal v-model="showModal" ref="delete-contribution-modal" id="delete-contribution-modal" title="Delete Contribution" centered no-close-on-backdrop header-bg-variant="danger" header-text-variant="white">
      Are you sure you want to delete this contribution? <br>
      Caution! This contribution is paired to the following paychecks! <br>
      <ul v-if="contribution.paychecks.length > 0">
        <li v-for="paycheck in contribution.paychecks">
          {{ getIncome(paycheck).name }} - ${{ paycheck.amount == null ? paycheck.amount_project : paycheck.amount }} - Paid on: {{ paidOnFormat(paycheck) }}
        </li>
      </ul>
      These pairings will be deleted when/if the goal is saved (another confirmation will be displayed).
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
          paychecks: [],
        },
      };
    },
    created() {
      EventBus.$on('delete-contribution', (data) => {
        this.index = data.index;
        this.contribution.id = data.contribution.id;
        this.contribution.amount = data.contribution.amount;
        this.contribution.day_due_on = data.contribution.day_due_on;
        this.contribution.start_on = data.contribution.start_on;
        this.contribution.end_on = data.contribution.end_on;
        this.contribution.paychecks = [];
        for(let i in data.contribution.paychecks) {
          this.contribution.paychecks.push(cloneDeep(data.contribution.paychecks[i]));
        }
        this.showModal = true;
      });
    },
    beforeDestroy() {
      EventBus.$off('delete-contribution');
    },
    methods: {
      onDelete() {
        EventBus.$emit('delete-contribution-confirm', {
          index: this.index,
          contribution: this.contribution,
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
