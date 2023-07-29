<template>
  <div id="delete-bill">
    <b-modal v-model="showModal" ref="delete-bill-modal" id="delete-bill-modal" title="Delete Bill" centered no-close-on-backdrop>
      Are you sure you want to delete the bill {{ bill.name }}? <br>
      All bill-paycheck pairing's will also be deleted.
      <template slot="modal-footer">
        <b-button size="sm" variant="danger" @click="onDelete(bill)">
          Delete
        </b-button>
        <b-button size="sm" variant="base" @click="$emit('close')">
          Cancel
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
  import { BModal, BButton } from 'bootstrap-vue';
  export default {
    components: {
      'b-modal': BModal,
      'b-button': BButton,
    },
    props: {
      show: {
        type: Boolean,
        required: true,
      },
    },
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
        this.showModal = true;
      });
    },
    methods: {
      onDelete() {
        this.$store.dispatch('deleteBill', this.bill);
        this.$emit('close');
      },
    },
    computed: {
      showModal: {
        get() {
          return this.show;
        },
        set(value) {
          if(value) {
            this.$emit('open');
          } else {
            this.$emit('close');
          }
        }
      },
    },
  }
</script>
