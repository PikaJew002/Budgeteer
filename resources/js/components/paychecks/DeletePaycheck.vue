<template>
  <div id="delete-paycheck">
    <b-modal v-model="showModal" ref="delete-paycheck-modal" id="delete-paycheck-modal" title="Delete Paycheck" centered no-close-on-backdrop>
      Are you sure you want to delete this paycheck? <br>
      All bill-paycheck pairing's will also be deleted.
      <template slot="modal-footer">
        <b-button size="sm" variant="danger" @click="onDelete(paycheck)">
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
        this.showModal = true;
      });
    },
    methods: {
      onDelete() {
        this.$store.dispatch('deletePaycheck', this.paycheck);
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
