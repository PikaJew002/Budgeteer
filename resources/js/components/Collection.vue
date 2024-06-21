<template>
  <div class="container">
    <div :class="`row row-cols-1 row-cols-md-${size}`">
      <div v-for="item in items" :key="item.id" class="col mb-4">
        <ItemBill
          v-if="type === 'bill'"
          :bill="item"
          :month="month ? month : null"
        />
        <ItemPaycheck
          v-else-if="type === 'paycheck'"
          :paycheck="item"
        />
        <ItemIncome
          v-else
          :income="item"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import ItemBill from './bills/ItemBill.vue';
import ItemPaycheck from './paychecks/ItemPaycheck.vue';
import ItemIncome from './incomes/ItemIncome.vue';

let props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  month: {
    type: Array,
    required: false,
  },
  size: {
    type: Number,
    default: 4, // defaults to 4 items per row
  },
});

let emit = defineEmits(['add-item', 'open-item', 'delete-item', 'edit-item']);
</script>
