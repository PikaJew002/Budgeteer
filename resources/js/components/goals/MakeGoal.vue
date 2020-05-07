<template>
  <div>
    <b-alert :show="message.countDown"
             dismissible
             :variant="message.type"
             fade
             @dismissed="message.countDown=0"
             @dismiss-count-down="countDownChanged">
      {{message.message}}
    </b-alert>
    <b-modal v-model="showModal" ref="make-goal-modal" id="make-goal-modal" title="Make Goal" centered no-close-on-backdrop>
      <form @submit.prevent="onSave(goal)">
        <div class="form-group">
          <label for="name">Name</label>
          <input class="form-control" :class="{ 'is-invalid': $v.goal.name.$invalid && !$v.goal.name.$pending,
                                                'is-valid': !$v.goal.name.$invalid && !$v.goal.name.$pending }"
                 id="name" type="text" placeholder="Goal Name" v-model="goal.name">
          <div v-if="!$v.goal.name.required" class="invalid-feedback">
            Name is required
          </div>
          <div v-if="!$v.goal.name.minLength" class="invalid-feedback">
            Name must be at least 2 characters
          </div>
          <div v-if="!$v.goal.name.maxLength" class="invalid-feedback">
            Name cannot be more than 50 characters
          </div>
        </div>
        <div class="form-group">
          <label for="amount">Amount</label>
          <div class="input-group">
            <div class="input-group-prepend">
              <div class="input-group-text">$</div>
            </div>
            <input class="form-control" id="amount" type="text" placeholder="Amount"
                   v-model="goal.amount" @blur="formatAmount()"
                    :class="{ 'is-invalid': $v.goal.amount.$invalid && !$v.goal.amount.$pending,
                              'is-valid': !$v.goal.amount.$invalid && !$v.goal.amount.$pending }">
          </div>
          <div v-if="!$v.goal.amount.validDecimal" class="invalid-feedback d-block">
            Amount must be a valid decimal ($xx xxx xxx.xx)
          </div>
        </div>
      </form>
      <template slot="modal-footer">
        <b-button size="sm" variant="sub1" @click="$emit('close')">
          Cancel
        </b-button>
        <b-button size="sm" variant="base" @click="onSave(goal)">
          Save
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
  import { BModal, BAlert, BButton } from 'bootstrap-vue';
  import { helpers, required, minLength, maxLength } from 'vuelidate/lib/validators';
  import Alert from '../../api/alert.js';
  import { EventBus } from '../../event-bus.js';
  const validDecimal = helpers.regex('validDecimal', /^\d{0,8}(\.\d{0,2})?$/);
  export default {
    components: {
      'b-modal': BModal,
      'b-alert': BAlert,
      'b-button': BButton,
    },
    props: {
      user: {
        type: Object,
      },
      show: {
        type: Boolean,
        required: true,
      }
    },
    mixins: [Alert],
    data() {
      return {
        goal: {
          name: "",
          amount: null,
        },
      };
    },
    validations: {
      goal: {
        name: {
          required,
          minLength: minLength(2),
          maxLength: maxLength(255),
        },
        amount: {
          validDecimal,
        },
      },
    },
    created() {
      EventBus.$on('make-goal', () => {
        this.goal.name = "";
        this.goal.amount = null;
        this.showModal = true;
      });
    },
    beforeDestroy() {
      EventBus.$off('make-goal');
    },
    methods: {
      onSave(goal) {
        if(!this.$v.goal.$invalid) {
          this.$store.dispatch('addGoal', goal);
          this.$emit('close');
        }
      },
      formatAmount() {
        if(Number(this.goal.amount).toFixed(2) != "NaN") {
          this.goal.amount = Number(this.goal.amount).toFixed(2);
        }
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
        },
      },
    },
  };
</script>
