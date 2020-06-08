<template>
  <main class="py-4">
    <div id="home" class="container-fluid">
      <select :disabled="disableSelector" class="custom-select custom-select-lg mb-3" v-model.number="incomesSelected">
        <option value="0" selected>All Incomes</option>
        <option v-for="income in incomes" :key="income.id" :value="income.id">
          {{ income.name }}
        </option>
      </select>
      <calendar :total-months="3"
                :incomes="incomesSelected">
      </calendar>
    </div>
  </main>
</template>

<script>
  import Calendar from '../components/Calendar.vue';
  import { EventBus } from '../event-bus.js';
  import moment from 'moment';
  export default {
    components: {
      Calendar,
    },
    data() {
      return {
        incomesSelected: 0,
        disableSelector: false,
      };
    },
    created() {
      if(this.billsLoadStatus < 2) {
        this.$store.dispatch('loadBills', {
          with: ['paychecks'],
        });
      }
      if(this.incomesLoadStatus < 2) {
        this.$store.dispatch('loadIncomes', {
          with: ['paychecks.bills', 'paychecks.contributions'],
        });
      }
      if(this.goalsLoadStatus < 2) {
        this.$store.dispatch('loadGoals', {
          with: ['contributions.paychecks'],
        });
      }
      EventBus.$on('paycheck-pairable-pair-start', id => this.disableSelector = true);
      EventBus.$on('paycheck-pair-start', id => this.disableSelector = true);
      EventBus.$on('paycheck-pairable-pair-end', id => this.disableSelector = false);
      EventBus.$on('paycheck-pair-end', id => this.disableSelector = false);
    },
    beforeDestroy() {
      EventBus.$off('paycheck-pairable-pair-start');
      EventBus.$off('paycheck-pair-start');
      EventBus.$off('paycheck-pairable-pair-end');
      EventBus.$off('paycheck-pair-end');
    },
    computed: {
      /**
        Gets the incomes
        */
      incomes() {
        return this.$store.getters.getIncomes;
      },
      incomesLoadStatus() {
        return this.$store.getters.getIncomesLoadStatus;
      },
      billsLoadStatus() {
        return this.$store.getters.getBillsLoadStatus;
      },
      goalsLoadStatus() {
        return this.$store.getters.getGoalsLoadStatus;
      },
      /**
        Gets currently selected incomes
        */
      incomesSelect() {
        return this.incomes.filter((income) => {
          if(this.incomesSelected == 0) return true;
          return income.id == this.incomesSelected;
        });
      },
    },
  }
</script>
