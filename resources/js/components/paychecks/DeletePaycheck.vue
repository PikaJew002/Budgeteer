<template>
  <div id="delete-paycheck">
    <Modal :show="show" @hide="$emit('close')" id="delete-paycheck-modal" title="Delete Paycheck">
      Are you sure you want to delete this paycheck? <br>
      All bill-paycheck pairing's will also be deleted.
      <template v-slot:modal-footer>
        <button class="btn btn-danger btn-sm" @click="onDelete(paycheck)">
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
      paycheck: {
        id: null,
        income_id: null,
        amount: null,
        amount_project: null,
        paid_on: null,
      },
    };
  },
  created() {
    this.$eventBus.on('delete-paycheck', obj => {
      this.paycheck.id = obj.id;
      this.paycheck.income_id = obj.income_id;
      this.paycheck.amount = obj.amount;
      this.paycheck.amount_project = obj.amount_project;
      this.paycheck.paid_on = obj.paid_on;
      this.$emit('open');
    });
  },
  methods: {
    onDelete() {
      this.$store.dispatch('deletePaycheck', this.paycheck);
      this.$emit('close');
    },
  },
}
</script>
