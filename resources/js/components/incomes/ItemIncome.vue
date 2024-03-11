<template>
  <div
    :class="['card', highlight ? 'border-base shadow-lg' : '']"
    @mouseover="highlight = true"
    @mouseleave="highlight = false"
  >
    <div class="card-body">
      <div class="text-center">
        <h5 class="card-title">
          {{ income.name }}
        </h5>
      </div>
      <div class="text-center mt-2">
        <button class="btn btn-outline-sub1 btn-sm" @click="onModify()">Edit</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue';

let props = defineProps({
  income: {
    type: Object,
    required: true,
  },
});

let eventBus = inject('eventBus');

let highlight = ref(false);

function onModify() {
  eventBus.emit('modify-income', props.income);
}
</script>
