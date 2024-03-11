<template>
  <div id="delete-income">
    <Modal :show="show" @hide="$emit('close')" id="delete-income-modal" title="Delete Income">
      Are you sure you want to delete the {{ income.name }} source of income? <br>
      All paychecks associated with that source of income will be deleted as well.
      <template v-slot:modal-footer>
        <button class="btn btn-danger btn-sm" @click="onDelete(income)">
          Delete
        </button>
        <button class="btn btn-base btn-sm" @click="$emit('close')">
          Cancel
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { inject, reactive } from 'vue';
import Modal from '../Modal.vue';
import { useStore } from 'vuex';

let props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
});

let emit = defineEmits(['open', 'close']);

let eventBus = inject('eventBus');

let store = useStore();

let income = reactive({
  id: null,
  name: '',
});

function onDelete() {
  store.dispatch('deleteIncome', income.id);
  emit('close');
}

eventBus.on('delete-income', (incomeObj) => {
  income.id = incomeObj.id;
  income.name = incomeObj.name;
  emit('close');
});
</script>
