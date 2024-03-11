<template>
  <div id="delete-bill">
    <Modal :show="show" @hide="$emit('close')" id="delete-bill-modal" title="Delete Bill">
      Are you sure you want to delete the bill {{ bill.name }}? <br>
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
import { inject, reactive } from 'vue';
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

let bill = reactive({
  id: null,
  name: "",
});

eventBus.on('delete-bill', (billObj) => {
  bill.id = billObj.id;
  bill.name = billObj.name;
  emit('open');
});

function onDelete() {
  store.dispatch('deleteBill', bill.id);
  emit('close');
}
</script>
