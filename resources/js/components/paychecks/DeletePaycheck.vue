<template>
  <div id="delete-paycheck">
    <Modal :show="show" @hide="$emit('close')" id="delete-paycheck-modal" title="Delete Paycheck">
      Are you sure you want to delete this paycheck? <br>
      All bill-paycheck pairing's will also be deleted.
      <template v-slot:modal-footer>
        <button class="btn btn-danger btn-sm" @click="onDelete()">
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
import { reactive, inject } from 'vue';
import { useStore } from 'vuex';
import Modal from '../Modal.vue';

let props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
});

let emit = defineEmits(['open', 'close']);

let eventBus = inject('eventBus');

let store = useStore();

let paycheck = reactive({
  id: null,
});

eventBus.on('delete-paycheck', (paycheckObj) => {
  paycheck.id = paycheckObj.id;
  emit('open');
});

function onDelete() {
  store.dispatch('deletePaycheck', paycheck.id);
  emit('close');
}
</script>
