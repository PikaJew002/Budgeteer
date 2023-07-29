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
        this.$store.dispatch('loadIncomes');
      }
      if(this.paychecksLoadStatus < 2) {
        this.$store.dispatch('loadPaychecks');
      }
      if(this.goalsLoadStatus < 2) {
        this.$store.dispatch('loadGoals');
      }
      if(this.contributionsLoadStatus < 2) {
        this.$store.dispatch('loadContributions', {
          with: ['paychecks'],
        })
      }
      this.$eventBus.on('paycheck-pairable-pair-start', ({ pairable, month, type}) => this.disableSelector = true);
      this.$eventBus.on('paycheck-pair-start', id => this.disableSelector = true);
      this.$eventBus.on('paycheck-pairable-pair-end', ({ pairable, month, type }) => this.disableSelector = false);
      this.$eventBus.on('paycheck-pair-end', (paycheck) => this.disableSelector = false);
    },
    beforeDestroy() {
      this.$eventBus.off('paycheck-pairable-pair-start');
      this.$eventBus.off('paycheck-pair-start');
      this.$eventBus.off('paycheck-pairable-pair-end');
      this.$eventBus.off('paycheck-pair-end');
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
      paychecksLoadStatus() {
        return this.$store.getters.getPaychecksLoadStatus;
      },
      billsLoadStatus() {
        return this.$store.getters.getBillsLoadStatus;
      },
      goalsLoadStatus() {
        return this.$store.getters.getGoalsLoadStatus;
      },
      contributionsLoadStatus() {
        return this.$store.getters.getContributionsLoadStatus;
      },
      /**
        Gets currently selected incomes
        */
      incomesSelect() {
        return this.incomes.filter((income, id) => {
          if(this.incomesSelected == 0) return true;
          return id == this.incomesSelected;
        });
      },
    },
    beforeRouteLeave(to, from, next) {
      window.$('.collapse').collapse('hide');
      next();
    },
  }
</script>
