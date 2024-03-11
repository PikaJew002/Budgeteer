<template>
  <main class="py-4">
    <div id="incomes" class="container-fluid">
      <MakeIncome
        :show="showMake"
        @open="showMake = true"
        @close="showMake = false"
      />
      <ModifyIncome
        :show="showModify"
        @open="showModify = true"
        @close="showModify = false"
      />
      <DeleteIncome
        :show="showDelete"
        @open="showDelete = true"
        @close="showDelete = false"
      />
      <div class="card bg-transparent">
        <div class="card-header d-flex justify-content-between bg-smokewhite-100">
          <h3>Sources of Income</h3>
          <button type="button" class="btn btn-outline-base" @click="makeIncome()">+</button>
        </div>
        <div class="card-body bg-white-50">
          <Collection :items="incomes" type="income" :size="3"/>
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

<script setup>
import { ref, computed, inject } from 'vue';
import { useStore } from 'vuex';
import { onBeforeRouteLeave } from 'vue-router';
import Collection from '../components/Collection.vue';
import MakeIncome from '../components/incomes/MakeIncome.vue';
import ModifyIncome from '../components/incomes/ModifyIncome.vue';
import DeleteIncome from '../components/incomes/DeleteIncome.vue';

let showMake = ref(false);
let showModify = ref(false);
let showDelete = ref(false);

let store = useStore();

let eventBus = inject('eventBus');

let incomes = computed(() => store.getters.getIncomes);

let incomesLoadStatus = computed(() => store.getters.getIncomesLoadStatus);

let paychecksLoadStatus = computed(() => store.getters.getPaychecksLoadStatus);

let billsLoadStatus = computed(() => store.getters.getBillsLoadStatus);

let collapse = computed(() => store.getters.getNavCollapse);

if (billsLoadStatus.value < 2) {
  store.dispatch('loadBills', {
    with: ['paychecks'],
  });
}
if (incomesLoadStatus.value < 2) {
  store.dispatch('loadIncomes');
}
if (paychecksLoadStatus.value < 2) {
  store.dispatch('loadPaychecks');
}

function makeIncome() {
  eventBus.emit('make-income');
}

onBeforeRouteLeave((to, from) => {
  collapse.value.hide();
});
</script>
