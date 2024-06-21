<template>
  <div id="make-income">
    <Modal :show="show" @hide="$emit('close')" id="make-income-modal" title="Make Income">
      <form @submit.prevent="onSave()">
        <div class="form-group">
          <label for="name">Name: </label>
          <input
            v-model="income.name"
            id="name"
            type="text"
            placeholder="Income Name"
            class="form-control"
            :class="validationInputClasses(v$, 'income', 'name')"
          >
          <div v-if="!v$.name.required" class="invalid-feedback">
            Name is required
          </div>
          <div v-if="!v$.name.minLength" class="invalid-feedback">
            Name must be at least 2 characters
          </div>
          <div v-if="!v$.name.maxLength" class="invalid-feedback">
            Name cannot be more than 50 characters
          </div>
        </div>
      </form>
      <template v-slot:modal-footer>
        <button class="btn btn-sub1 btn-sm" @click="$emit('close')">
          Cancel
        </button>
        <button class="btn btn-base btn-sm" @click="onSave()">
          Save
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { reactive, inject, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, maxLength } from '@vuelidate/validators';
import Modal from '../Modal.vue';
import { validationInputClasses } from '../../utils/validation.js';

let props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
});

let emit = defineEmits(['open', 'close']);

let eventBus = inject('eventBus');

let store = useStore();

let income = reactive({ name: '' });

let v$ = useVuelidate({
  name: {
    required,
    minLength: minLength(2),
    maxLength: maxLength(50),
  },
}, income);

function onSave() {
  if (!v$.$invalid) {
    store.dispatch('addIncome', income);
    emit('close');
  }
};

eventBus.on('make-income', () => {
  income.name = '';
  emit('open');
});

onBeforeUnmount(() => {
  eventBus.off('make-income');
});
</script>
