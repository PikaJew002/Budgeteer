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
    <b-modal v-model="showModal" ref="make-income-modal" id="make-income-modal" title="Make Income" centered no-close-on-backdrop>
      <form @submit.prevent="onSave(income)">
        <div class="form-group">
          <label for="name">Name: </label>
          <input
            v-model="income.name"
            id="name"
            type="text"
            placeholder="Income Name"
            class="form-control"
            :class="validationClasses($v, 'income', 'name')"
          >
          <div v-if="!$v.income.name.required" class="invalid-feedback">
            Name is required
          </div>
          <div v-if="!$v.income.name.minLength" class="invalid-feedback">
            Name must be at least 2 characters
          </div>
          <div v-if="!$v.income.name.maxLength" class="invalid-feedback">
            Name cannot be more than 50 characters
          </div>
        </div>
      </form>
      <template slot="modal-footer">
        <b-button size="sm" variant="sub1" @click="$emit('close')">
          Cancel
        </b-button>
        <b-button size="sm" variant="base" @click="onSave(income)">
          Save
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
  import { BModal, BAlert, BButton } from 'bootstrap-vue';
  import { required, minLength, maxLength } from 'vuelidate/lib/validators';
  import Alert from '../../api/alert.js';
  import { EventBus } from '../../event-bus.js';
  import { validationInputClasses } from '../../utils/validation.js';
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
      },
    },
    mixins: [Alert],
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
      EventBus.$on('make-income', () => {
        this.income.name = "";
        this.showModal = true;
      });
    },
    beforeDestroy() {
      EventBus.$off('make-income');
    },
    methods: {
      validationClasses(v$, obj, attr) {
        return validationInputClasses(v$, obj, attr);
      },
      onSave(income) {
        if(!this.$v.income.$invalid) {
          this.$store.dispatch('addIncome', income);
          this.$emit('close');
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
        }
      },
    },
  };
</script>
