<template>
  <div id="delete-goal">
    <b-modal v-model="showModal" ref="delete-goal-modal" id="delete-goal-modal" title="Delete Goal" centered no-close-on-backdrop>
      Are you sure you want to delete the {{ goal.name }} goal? <br>
      All contributions associated with that goal will be deleted as well.
      <template slot="modal-footer">
        <b-button size="sm" variant="danger" @click="onDelete(goal)">
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
  import { EventBus } from '../../event-bus.js';
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
        goal: {
          id: 0,
          user_id: 0,
          name: "",
          amount: null,
        },
      };
    },
    created() {
      EventBus.$on('delete-goal', obj => {
        this.goal.id = obj.id;
        this.goal.user_id = obj.user_id;
        this.goal.name = obj.name;
        this.goal.amount = obj.amount;
        this.showModal = true;
      });
    },
    methods: {
      onDelete() {
        this.$store.dispatch('deleteGoal', this.goal.id);
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
