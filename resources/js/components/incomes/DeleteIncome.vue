<template>
  <div id="delete-income">
    <b-modal v-model="showModal" ref="delete-income-modal" id="delete-income-modal" title="Delete Income" centered no-close-on-backdrop>
      Are you sure you want to delete the {{ income.name }} source of income? <br>
      All paychecks associated with that source of income will be deleted as well.
      <template slot="modal-footer">
        <b-button size="sm" variant="danger" @click="onDelete(income)">
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
        this.showModal = true;
      });
    },
    methods: {
      onDelete() {
        this.$store.dispatch('deleteIncome', this.income);
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
