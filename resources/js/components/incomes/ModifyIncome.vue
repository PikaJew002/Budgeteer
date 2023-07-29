<template>
  <div id="modify-income">
    <b-alert :show="message.countDown"
             dismissible
             :variant="message.type"
             fade
             @dismissed="message.countDown=0"
             @dismiss-count-down="countDownChanged">
      {{message.message}}
    </b-alert>
    <b-modal v-model="showModal" ref="modify-income-modal" id="modify-income-modal" title="Edit Income" centered no-close-on-backdrop>
      <form @submit.prevent="onSave(income)">
        <div class="form-group">
          <label for="name">Name: </label>
          <input
            v-model="income.name"
            id="name"
            type="text"
            placeholder="Name"
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
        <b-button size="sm" variant="danger" @click="onDelete(income)">
          Delete
        </b-button>
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
  import { copyObjectProperties } from '../../utils/main.js';
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
          id: null,
          user_id: null,
          name: "",
          created_at: "",
          updated_at: "",
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
      this.$eventBus.on('modify-income', (income) => {
        copyObjectProperties(income, this.income);
        this.showModal = true;
      });
    },
    beforeDestroy() {
      this.$eventBus.off('modify-income');
    },
    methods: {
      validationClasses(v$, obj, attr) {
        return validationInputClasses(v$, obj, attr);
      },
      onSave(income) {
        if(!this.$v.income.$invalid) {
          this.$store.dispatch('editIncome', income);
          this.$emit('close');
        }
      },
      onDelete(income) {
        this.$eventBus.emit('delete-income', income);
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
  };
</script>
