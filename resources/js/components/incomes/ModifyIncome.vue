<template>
  <div id="modify-income">
    <Modal :show="show" @hide="$emit('close')" id="modify-income-modal" title="Edit Income">
      <form @submit.prevent="onSave(income)">
        <div class="form-group">
          <label for="name">Name: </label>
          <input
            v-model="income.name"
            id="name"
            type="text"
            placeholder="Name"
            class="form-control"
            :class="validationClasses(v$, 'income', 'name')"
          >
          <div v-if="!v$.income.name.required" class="invalid-feedback">
            Name is required
          </div>
          <div v-if="!v$.income.name.minLength" class="invalid-feedback">
            Name must be at least 2 characters
          </div>
          <div v-if="!v$.income.name.maxLength" class="invalid-feedback">
            Name cannot be more than 50 characters
          </div>
        </div>
      </form>
      <template v-slot:modal-footer>
        <button class="btn btn-danger btn-sm" @click="onDelete(income)">
          Delete
        </button>
        <button class="btn btn-sub1 btn-sm" @click="$emit('close')">
          Cancel
        </button>
        <button class="btn btn-base btn-sm" @click="onSave(income)">
          Save
        </button>
      </template>
    </Modal>
  </div>
</template>

<script>
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, maxLength } from '@vuelidate/validators';
import Modal from '../Modal.vue';
import { copyObjectProperties } from '../../utils/main.js';
import { validationInputClasses } from '../../utils/validation.js';
export default {
  components: {
    Modal,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['open', 'close'],
  setup() {
    return { v$: useVuelidate() }
  },
  data() {
    return {
      income: {
        id: null,
        user_id: null,
        name: "",
        created_at: "",
        updated_at: "",
      },
    };
  },
  validations: {
    income: {
      name: {
        required,
        minLength: minLength(2),
        maxLength: maxLength(50),
      },
    },
  },
  created() {
    this.$eventBus.on('modify-income', (income) => {
      copyObjectProperties(income, this.income);
      this.$emit('open');
    });
  },
  beforeUnmount() {
    this.$eventBus.off('modify-income');
  },
  methods: {
    validationClasses(v$, obj, attr) {
      return validationInputClasses(v$, obj, attr);
    },
    onSave(income) {
      if(!this.v$.income.$invalid) {
        this.$store.dispatch('editIncome', income);
        this.$emit('close');
      }
    },
    onDelete(income) {
      this.$eventBus.emit('delete-income', income);
      this.$emit('close');
    },
  },
}
</script>
