<template>
  <div id="delete-bill">
    <Modal :show="show" @hide="$emit('close')" id="delete-bill-modal" title="Delete Bill">
      Are you sure you want to delete the bill {{ bill.name }}? <br>
      All bill-paycheck pairing's will also be deleted.
      <template v-slot:modal-footer>
        <button class="btn btn-danger btn-sm" @click="onDelete(bill)">
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
      bill: {
        id: null,
        name: "",
        amount: null,
        day_due_on: null,
        start_on: "",
        end_on: "",
        created_at: "",
        updated_at: "",
      },
    };
  },
  created() {
    this.$eventBus.on('delete-bill', obj => {
      this.bill.id = obj.id;
      this.bill.name = obj.name;
      this.bill.amount = obj.amount;
      this.bill.day_due_on = obj.day_due_on;
      this.bill.start_on = obj.start_on;
      this.bill.end_on = obj.end_on;
      this.bill.created_at = obj.created_at;
      this.bill.updated_at = obj.updated_at;
      this.$emit('open');
    });
  },
  methods: {
    onDelete() {
      this.$store.dispatch('deleteBill', this.bill);
      this.$emit('close');
    },
  },
}
</script>
