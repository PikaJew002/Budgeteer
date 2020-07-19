<template>
  <div id="delete-goal">
    <b-modal v-model="showModal" ref="delete-goal-modal" id="delete-goal-modal" title="Delete Goal" centered no-close-on-backdrop header-bg-variant="danger" header-text-variant="white">
      Are you sure you want to delete the {{ goal.name }} goal? <br>
      <template v-if="goal.contributions.length > 0 || contributionsDeleted.length > 0">
        Caution! All contributions on this goal will be deleted as well. <br>
        <template v-if="paychecks.length > 0">
          The following paycheck-contribution pairings will also be deleted.
        </template>
        <ul v-if="paychecks.length > 0">
          <li v-for="paycheck in paychecks">
            {{ getIncome(paycheck).name }} - ${{ paycheck.amount == null ? paycheck.amount_project : paycheck.amount }} - {{ paidOnFormat(paycheck.paid_on) }}
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
      };
    },
    created() {
      EventBus.$on('delete-goal', data => {
        this.goal.id = data.goal.id;
        this.goal.name = data.goal.name;
        this.goal.amount = data.goal.amount;
        this.goal.initial_amount = data.goal.initial_amount;
        this.goal.contributions = [];
        for(let i in data.goal.contributions) {
          this.goal.contributions.push(data.goal.contributions[i]);
        }
        this.contributionsDeleted = [];
        for(let j in data.contributionsDeleted) {
          this.contributionsDeleted.push(data.contributionsDeleted[j]);
        }
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
      paychecks() {
        let paychecks = [];
        for(let i in this.goal.contributions) {
          if(this.goal.contributions[i].hasOwnProperty('paychecks')) {
            for(let j in this.goal.contributions[i].paychecks) {
              paychecks.push(this.goal.contributions[i].paychecks[j]);
            }
          }
        }
        for(let k in this.contributionsDeleted) {
          if(this.contributionsDeleted[k].hasOwnProperty('paychecks')) {
            for(let l in this.contributionsDeleted[k].paychecks) {
              var found = false;
              for(let m in paychecks) {
                if(this.contributionsDeleted[k].paychecks[l].id == paychecks[m].id) {
                  found = true;
                  break;
                }
              }
              if(!found) {
                paychecks.push(this.contributionsDeleted[k].paychecks[l]);
              }
            }
          }
        }
        return paychecks;
      },
    },
  }
</script>
