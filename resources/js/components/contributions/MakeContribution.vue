<template>
  <div>
    <b-modal v-model="showModal" ref="make-contribution-modal" id="make-contribution-modal" title="Make Goal Contribution" centered no-close-on-backdrop>
      <b-alert :show="message.countDown"
               dismissible
               :variant="message.type"
               fade
               @dismissed="message.countDown=0"
               @dismiss-count-down="countDownChanged">
        {{message.message}}
      </b-alert>
      <form @submit.prevent="onSave(contribution)">
        <h3>{{ monthSpanToString }}</h3>
        <div class="row">
          <div class="col form-group">
            <label for="amount">Amount</label>
            <div class="input-group">
              <div class="input-group-prepend">
                <div class="input-group-text">$</div>
              </div>
              <input class="form-control" id="amount" type="text" placeholder="Amount"
                     v-model="contribution.amount" @blur="formatAmount()"
                     :class="{ 'is-invalid': $v.contribution.amount.$invalid && !$v.contribution.amount.$pending,
                               'is-valid': !$v.contribution.amount.$invalid && !$v.contribution.amount.$pending }">
            </div>
            <div v-if="!$v.contribution.amount.required" class="invalid-feedback d-block">
              Amount is required
            </div>
            <div v-if="!$v.contribution.amount.validDecimal" class="invalid-feedback d-block">
              Amount must be a valid decimal ($xx xxx xxx.xx)
            </div>
            <div v-if="$v.contribution.amount.validDecimal && !$v.contribution.amount.notZero" class="invalid-feedback d-block">
              Amount must be greater than zero (0)
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col form-group">
            <label for="start_on">Start On Date: </label>
            <input class="form-control"
                   :class="{ 'is-invalid': $v.contribution.start_on.$invalid && !$v.contribution.start_on.$pending,
                             'is-valid': !$v.contribution.start_on.$invalid && !$v.contribution.start_on.$pending }"
                   id="start_on"
                   type="date"
                   placeholder="mm/dd/yyyy"
                   v-model="contribution.start_on">
            <div v-if="!$v.contribution.start_on.required" class="invalid-feedback">
              Start On Date is required
            </div>
          </div>
          <div class="col form-group">
            <label for="end_on">End On Date: </label>
            <input class="form-control"
                   :class="{ 'is-invalid': $v.contribution.end_on.$invalid && !$v.contribution.end_on.$pending,
                             'is-valid': !$v.contribution.end_on.$invalid && !$v.contribution.end_on.$pending }"
                   id="end_on"
                   type="date"
                   placeholder="mm/dd/yyyy"
                   v-model="contribution.end_on">
            <div v-if="!$v.contribution.end_on.required" class="invalid-feedback">
              End On Date is required
            </div>
            <div v-if="!$v.contribution.end_on.minDate" class="invalid-feedback">
              End On Date must be after the Start On Date
            </div>
          </div>
        </div>
      </form>
      <template slot="modal-footer">
        <b-button size="sm" variant="sub1" @click="$emit('close')">
          Cancel
        </b-button>
        <b-button size="sm" variant="base" @click="onSave(contribution)">
          Save
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
  import { BModal, BAlert, BButton } from 'bootstrap-vue';
  import { helpers, required, minLength, maxLength } from 'vuelidate/lib/validators';
  import { cloneDeep } from 'lodash';
  import moment from 'moment';
  import Alert from '../../api/alert.js';
  import { EventBus } from '../../event-bus.js';
  const validDecimal = helpers.regex('validDecimal', /^\d{0,6}(\.\d{0,2})?$/); // double(8,2)
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
        type: "",
        contribution: {
          amount: null,
          start_on: null,
          end_on: null,
        },
      };
    },
    validations() {
      return {
        contribution: {
          amount: {
            required,
            validDecimal,
            notZero: (amount) => ((amount == "" || amount == null) || (Number(amount) > 0)), // allows null and ""
          },
          start_on: {
            required,
          },
          end_on: {
            required,
            minDate: (end_on) => (end_on == "" || moment(end_on).isAfter(this.contribution.start_on)),
          },
        },
      };
    },
    created() {
      EventBus.$on('make-contribution', (type) => {
        this.type = type;
        this.contribution.amount = null;
        this.contribution.start_on = null;
        this.contribution.end_on = null;
        this.showModal = true;
      });
      EventBus.$on('close-make-contribution', () => {
        this.showModal = false;
      });
      EventBus.$on('show-contribution-alert', (messageArr) => {
        this.showAlert(messageArr[0], messageArr[1], messageArr[2]);
      });
    },
    beforeDestroy() {
      EventBus.$off('make-contribution');
      EventBus.$off('close-make-contribution');
      EventBus.$off('show-contribution-alert');
    },
    methods: {
      onSave(contribution) {
        if(!this.$v.contribution.$invalid) {
          let newContribution = cloneDeep(contribution);
          newContribution.monthSpan = this.monthSpan;
          newContribution.diff = Math.ceil(moment(newContribution.end_on).diff(newContribution.start_on, 'months', true));
          EventBus.$emit('save-contribution', [this.type, newContribution]);
        }
      },
      formatAmount() {
        if(Number(this.contribution.amount).toFixed(2) != "NaN" && this.contribution.amount != "" && this.contribution.amount != null) {
          this.contribution.amount = Number(this.contribution.amount).toFixed(2);
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
      monthSpan() {
        if(!this.$v.contribution.$invalid) {
          if(moment(this.contribution.start_on).isSame(this.contribution.end_on, 'month')) {
            return [moment(this.contribution.start_on).format('MMM YYYY')];
          } else {
            return [moment(this.contribution.start_on).format('MMM YYYY'), moment(this.contribution.end_on).format('MMM YYYY')]
          }
        } else {
          return [];
        }
      },
      monthSpanToString() {
        if(this.monthSpan.length > 0) {
          if(this.monthSpan.length > 1) {
            return this.monthSpan[0] + " - " + this.monthSpan[1];
          }
          return this.monthSpan[0];
        }
        return "";
      },
    },
  };
</script>
