<template>
  <div id="make-goal">
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
        <div class="row">
          <div class="col form-group">
            <label for="name">Name</label>
            <input
              v-model="goal.name"
              id="name"
              type="text"
              placeholder="Goal Name"
              class="form-control"
              :class="validationClasses($v, 'goal', 'name')"
            >
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
        </div>
        <div class="row">
          <div class="col form-group">
            <label for="amount">Amount</label>
            <div class="input-group">
              <div class="input-group-prepend">
                <div class="input-group-text">$</div>
              </div>
              <input
                v-model="goal.amount"
                @blur="goal.amount = formatAmount(goal.amount)"
                id="amount"
                type="text"
                placeholder="Amount"
                class="form-control"
                :class="validationClasses($v, 'goal', 'amount')"
              >
            </div>
            <div v-if="!$v.goal.amount.required" class="invalid-feedback d-block">
              Amount is required
            </div>
            <div v-if="!$v.goal.amount.validDecimal" class="invalid-feedback d-block">
              Amount must be a valid decimal ($xx xxx xxx.xx)
            </div>
            <div v-if="$v.goal.amount.validDecimal && !$v.goal.amount.notZero" class="invalid-feedback d-block">
              Amount must be greater than zero (0.00)
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col form-group">
            <label for="initial_amount">Initial Amount (optional)</label>
            <div class="input-group">
              <div class="input-group-prepend">
                <div class="input-group-text">$</div>
              </div>
              <input
                v-model="goal.initial_amount"
                @blur="goal.initial_amount = formatAmount(goal.initial_amount)"
                id="initial_amount"
                type="text"
                placeholder="Amount"
                class="form-control"
                :class="validationClasses($v, 'goal', 'initial_amount')"
              >
            </div>
            <div v-if="!$v.goal.initial_amount.validDecimal" class="invalid-feedback d-block">
              Initial Amount must be a valid decimal ($xx xxx xxx.xx)
            </div>
            <div v-if="$v.goal.initial_amount.validDecimal && !$v.goal.initial_amount.notZero" class="invalid-feedback d-block">
              Initial Amount must be greater than zero (0.00)
            </div>
          </div>
        </div>
      </form>
      <template slot="modal-footer">
        <b-button size="sm" variant="sub1" @click="$emit('close')">
          Cancel
        </b-button>
        <b-button size="sm" variant="base" @click="onSaveAndClose(goal)">
          Save and Close
        </b-button>
        <b-button size="sm" variant="base" @click="onSaveAndEdit(goal)">
          Save and Add Contributions
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
  import { BModal, BAlert, BButton, BProgress, BProgressBar } from 'bootstrap-vue';
  import { helpers, required, minLength, maxLength } from 'vuelidate/lib/validators';
  import Alert from '../../api/alert.js';
  import { numberToString, emptyStringToNull } from '../../utils/main.js';
  import { notZero, validationInputClasses } from '../../utils/validation.js';
  const validDecimal = helpers.regex('validDecimal', /^\d{0,8}(\.\d{0,2})?$/); // double(10,2)
  export default {
    components: {
      'b-modal': BModal,
      'b-alert': BAlert,
      'b-button': BButton,
      'b-progress': BProgress,
      'b-progress-bar': BProgressBar,
    },
    props: {
      user: {
        type: Object,
      },
      show: {
        type: Boolean,
        required: true,
      },
    },
    mixins: [Alert],
    data() {
      return {
        goal: {
          name: "",
          amount: null,
          initial_amount: null,
        },
      };
    },
    validations() {
      return {
        goal: {
          name: {
            required,
            minLength: minLength(2),
            maxLength: maxLength(255),
          },
          amount: {
            required,
            validDecimal,
            notZero,
          },
          initial_amount: {
            validDecimal,
            notZero,
          },
        },
      };
    },
    created() {
      this.$eventBus.on('make-goal', () => {
        this.goal.name = "";
        this.goal.amount = null;
        this.goal.initial_amount = null;
        this.showModal = true;
      });
    },
    beforeDestroy() {
      this.$eventBus.off('make-goal');
    },
    methods: {
      onSaveAndClose(goal) {
        if(!this.$v.goal.$invalid) {
          goal.initial_amount = emptyStringToNull(goal.initial_amount);
          this.$store.dispatch('addGoal', {
            goal: goal,
          });
          this.$emit('close');
        }
      },
      onSaveAndEdit(goal) {
        if(!this.$v.goal.$invalid) {
          goal.initial_amount = emptyStringToNull(goal.initial_amount);
          this.$store.dispatch('addGoal', {
            goal: goal,
          }).then((newGoal) => {
            this.$emit('close');
            this.$eventBus.emit('modify-goal', newGoal);
          });
        }
      },
      formatAmount(amount) {
        return numberToString(amount);
      },
      /* @TODO extract (along with input) into amount-input component */
      validationClasses(v$, obj, attr) {
        return validationInputClasses(v$, obj, attr);
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
      contributionsTotal() {
        return this.goal.contributions.reduce((acc, contribution) => {
          return acc + Number(contribution.amount)*contribution.diff;
        }, 0);
      },
    },
  };
</script>
