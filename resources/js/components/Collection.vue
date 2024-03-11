<template>
  <div>
    <div v-for="row in rowsFull" :key="row" class="card-deck mb-4">
      <template v-for="col in deckSize">
        <ItemBill
          v-if="type === 'bill'"
          :key="col + 'bill'"
          :bill="items[(row - 1) * deckSize + col - 1]"
          :month="month ? month : null"
        />
        <ItemPaycheck
          v-else-if="type === 'paycheck'"
          :key="col + 'paycheck'"
          :paycheck="items[(row - 1) * deckSize + col - 1]"
        />
        <ItemIncome
          v-else
          :key="col + 'income'"
          :income="items[(row - 1) * deckSize + col - 1]"
        />
      </template>
    </div>
    <div class="row">
      <div v-if="colsInPartialRow > 0" :class="'col-md-' + (12/deckSize)*colsInPartialRow">
        <div class="card-deck mb-4">
          <template v-for="col in colsInPartialRow">
            <ItemBill
              v-if="type === 'bill'"
              :key="col + 'bill'"
              :bill="items[rowsFull * deckSize + col - 1]"
              :month="month ? month : null"
            />
            <ItemPaycheck
              v-else-if="type === 'paycheck'"
              :key="col + 'paycheck'"
              :paycheck="items[rowsFull * deckSize + col - 1]"
            />
            <ItemIncome
              v-else
              :key="col + 'income'"
              :income="items[rowsFull * deckSize + col - 1]"
            />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
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

let deckSize = ref(props.size);

let rowsFull = computed(() => {
  return Math.floor(props.items.length / deckSize.value);
});

let colsInPartialRow = computed(() => {
  return (props.items.length % deckSize.value);
});

function openItem(index) {
  emit('open-item', index);
}

function deleteItem(index) {
  emit('delete-item', index);
}

function editItem(index) {
  emit('edit-item', index);
}

function canOpen(index) {
  for(let i in props.allowOpen) {
    if(props.allowOpen[i].id == props.items[index].id) {
      return true;
    }
  }
  return props.open;
}
</script>
