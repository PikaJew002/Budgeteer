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
      <div class="d-flex justify-content-between">
        <h3>Sources of Income</h3>
        <button type="button" class="btn btn-outline-base" @click="makeIncome()">+</button>
      </div>
      <hr>
      <collection :items="incomes"
                  type="income"
                  :size="3"></collection>
    </div>
  </main>
</template>

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
      if(this.incomesLoadStatus < 2) {
        this.$store.dispatch('loadIncomes', {
          with: ['paychecks.bills', 'paychecks.contributions'],
        });
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
        return this.$store.getters.getIncomes;
      },
    },
  }
</script>
