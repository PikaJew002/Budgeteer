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

<script>
import Modal from '../Modal.vue';
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
  data() {
    return {
      income: {
        id: null,
        name: "",
      },
    };
  },
  created() {
    this.$eventBus.on('delete-income', obj => {
      this.income.id = obj.id;
      this.income.name = obj.name;
      this.$emit('close');
    });
  },
  methods: {
    onDelete() {
      this.$store.dispatch('deleteIncome', this.income);
      this.$emit('close');
    },
  },
}
</script>
