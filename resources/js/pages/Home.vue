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
      Calendar
    },

    data() {
      return {
        incomesSelected: 0,
        disableSelector: false
      };
    },

    created() {
      this.$store.dispatch('loadBills', {
        with: ['paychecks']
      });
      this.$store.dispatch('loadIncomes', {
        with: ['paychecks.bills']
      });
      EventBus.$on('bill-pair-start', id => this.disableSelector = true);
      EventBus.$on('paycheck-pair-start', id => this.disableSelector = true);
      EventBus.$on('bill-pair-end', id => this.disableSelector = false);
      EventBus.$on('paycheck-pair-end', id => this.disableSelector = false);
    },

    computed: {
      /**
        Gets the user
        */
      user() {
        return this.$store.getters.getUser;
      },
      /**
        Gets the user load status
        */
      userLoadStatus() {
        return this.$store.getters.getUserLoadStatus();
      },
      /**
        Gets the incomes
        */
      incomes() {
        return this.$store.getters.getIncomes;
      },
      /**
        Gets the incomes load status
        */
      incomesLoadStatus() {
        return this.$store.getters.getIncomesLoadStatus;
      },
      /**
        Gets currently selected incomes
        */
      incomesSelect() {
        return this.incomes.filter((income) => {
          if(this.incomesSelected == 0) return true;
          return income.id == this.incomesSelected;
        });
      }
    }
  }
</script>
