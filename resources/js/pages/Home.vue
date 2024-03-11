<template>
  <main class="py-4">
    <div id="home" class="container-fluid">
      <Calendar/>
    </div>
  </main>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { onBeforeRouteLeave } from 'vue-router';
import Calendar from '../components/Calendar.vue';

let store = useStore();

let incomesLoadStatus = computed(() => {
  return store.getters.getIncomesLoadStatus;
});

let paychecksLoadStatus = computed(() => {
  return store.getters.getPaychecksLoadStatus;
});

let billsLoadStatus = computed(() => {
  return store.getters.getBillsLoadStatus;
});

let collapse = computed(() => {
  return store.getters.getNavCollapse;
});

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

onBeforeRouteLeave(() => {
  collapse.value.hide();
});
</script>
