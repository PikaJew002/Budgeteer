<template>
  <main class="py-4">
    <div id="incomes" class="container-fluid">
      <make-income :show="showMake"
                    @open="showMake = true"
                    @close="showMake = false"></make-income>
      <modify-income :show="showModify"
                    @open="showModify = true"
                    @close="showModify = false"></modify-income>
      <delete-income :show="showDelete"
                    @open="showDelete = true"
                    @close="showDelete = false"></delete-income>
      <div class="card bg-transparent">
        <div class="card-header d-flex justify-content-between bg-smokewhite-100">
          <h3>Sources of Income</h3>
          <button type="button" class="btn btn-outline-base" @click="makeIncome()">+</button>
        </div>
        <div class="card-body bg-white-50">
          <collection :items="incomes" type="income" :size="3"></collection>
        </div>
      </div>
    </div>
  </main>
</template>

<style>
  .bg-white-50 {
    background: rgb(255, 255, 255, 0.75);
  }
  .bg-smokewhite-100 {
    background: rgb(247, 247, 247, 1);
  }
</style>

<script>
  import Collection from '../../components/Collection.vue';
  import MakeIncome from '../../components/incomes/MakeIncome.vue';
  import ModifyIncome from '../../components/incomes/ModifyIncome.vue';
  import DeleteIncome from '../../components/incomes/DeleteIncome.vue';
  import { EventBus } from '../../event-bus.js';
  export default {
    components: {
      Collection,
      'make-income': MakeIncome,
      'modify-income': ModifyIncome,
      'delete-income': DeleteIncome,
    },
    data() {
      return {
        showMake: false,
        showModify: false,
        showDelete: false
      }
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
    },
    methods: {
      makeIncome() {
        EventBus.$emit('make-income');
      },
    },
    computed: {
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
    },
    beforeRouteLeave(to, from, next) {
      window.$('.collapse').collapse('hide');
      next();
    },
  }
</script>
