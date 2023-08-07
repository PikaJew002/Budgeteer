<template>
  <div id="make-income">
    <Modal :show="show" @hide="$emit('close')" id="make-income-modal" title="Make Income">
      <form @submit.prevent="onSave(income)">
        <div class="form-group">
          <label for="name">Name: </label>
          <input
            v-model="income.name"
            id="name"
            type="text"
            placeholder="Income Name"
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
        name: "",
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
    this.$eventBus.on('make-income', () => {
      this.income.name = "";
      this.$emit('open');
    });
  },
  beforeUnmount() {
    this.$eventBus.off('make-income');
  },
  methods: {
    validationClasses(v$, obj, attr) {
      return validationInputClasses(v$, obj, attr);
    },
    onSave(income) {
      if(!this.v$.income.$invalid) {
        this.$store.dispatch('addIncome', income);
        this.$emit('close');
      }
    },
  },
}
</script>
