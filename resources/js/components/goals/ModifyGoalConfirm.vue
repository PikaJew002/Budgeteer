<template>
  <div id="modify-goal-confirm">
    <b-modal v-model="showModal" ref="modify-goal-confirm-modal" id="modify-goal-confirm-modal" title="Edit Goal Confirmation" centered no-close-on-backdrop header-bg-variant="danger" header-text-variant="white">
      Are you sure you want to edit the {{ goal.name }} goal? <br>
      Caution! The following contribution-paycheck pairings will be removed due to changes in the contributions. <br>
      <ul>
        <template v-for="contribution in contributionsDeleted">
          <li v-for="paycheck in contribution.paychecks">
            {{ getIncome(paycheck).name }} - ${{ paycheck.amount == null ? paycheck.amount_project : paycheck.amount }} - {{ paidOnFormat(paycheck.paid_on) }}
          </li>
        </template>
        <li v-for="paycheck in paychecksDeleted">
          {{ getIncome(paycheck).name }} - ${{ paycheck.amount == null ? paycheck.amount_project : paycheck.amount }} - {{ paidOnFormat(paycheck.paid_on) }}
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
        goal: {
          id: null,
          name: "",
          amount: null,
          initial_amount: null,
          contributions: [],
        },
        contributionsDeleted: [],
        paychecksDeleted: [],
      };
    },
    created() {
      EventBus.$on('save-modify-goal', data => {
        this.goal.id = data.goal.id;
        this.goal.name = data.goal.name;
        this.goal.amount = data.goal.amount;
        this.goal.initial_amount = data.goal.initial_amount;
        this.contributionsDeleted = [];
        this.paychecksDeleted = [];
        for(let i in data.contributionsDeleted) {
          this.contributionsDeleted.push(data.contributionsDeleted[i]);
        }
        for(let j in data.paychecksDeleted) {
          this.paychecksDeleted.push(data.paychecksDeleted[j]);
        }
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
