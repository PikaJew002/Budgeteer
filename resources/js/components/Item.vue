<template>
  <div class="card"
       id="item"
       :class="{ 'border-base': (type === 'bills' && (bill_stay_highlighted || bill_highlight))
                                || (type === 'paychecks' && (paycheck_stay_highlighted || paycheck_highlight))
                                || (type === 'incomes' && (income_stay_highlighted || income_highlight))
                                || (type === 'goals' && (goal_stay_highlighted || goal_highlight)),
                 'shadow-lg': (type === 'bills' && (bill_stay_highlighted || bill_highlight))
                              || (type === 'paychecks' && (paycheck_stay_highlighted || paycheck_highlight))
                              || (type === 'incomes' && (income_stay_highlighted || income_highlight))
                              || (type === 'goals' && (goal_stay_highlighted || goal_highlight)) }"
       @mouseover="onHover(true)"
       @mouseleave="onHover(false)">
    <item-bill v-if="type === 'bills'"
               :bill="value"
               :month="month"
               :highlight="bill_highlight"
               :open="open"
               :remove="remove"
               :edit="edit"
               @bill-highlight="onBillHighlight"
               @bill-stay-highlighted="onBillStayHighlighted"></item-bill>
     <item-paycheck v-if="type === 'paychecks'"
                    :highlight="paycheck_highlight"
                    :paycheck="value"
                    :open="open"
                    :remove="remove"
                    :edit="edit"
                    @paycheck-highlight="onPaycheckHighlight"
                    @paycheck-stay-highlighted="onPaycheckStayHighlighted"></item-paycheck>
     <item-income v-if="type === 'incomes'"
                  :highlight="income_highlight"
                  :income="value"
                  :open="open"
                  :remove="remove"
                  :edit="edit"></item-income>
     <item-goal v-if="type === 'goals'"
                :highlight="goal_highlight"
                :goal="value"
                :open="open"
                :remove="remove"
                :edit="edit"></item-goal>
  </div>
</template>

<style>
  .elips {
    transform: rotate(-90deg);
  }
  .elips:after {
    content: '\2807';
    font-size: 15px;
  }
</style>

<script>
  import { EventBus } from '../event-bus.js';
  import ItemBill from './bills/ItemBill.vue';
  import ItemPaycheck from './paychecks/ItemPaycheck.vue';
  import ItemIncome from './incomes/ItemIncome.vue';
  import ItemGoal from './goals/ItemGoal.vue';
  export default {
    components: {
      'item-bill': ItemBill,
      'item-paycheck': ItemPaycheck,
      'item-income': ItemIncome,
      'item-goal': ItemGoal,
    },

    props: {
      value: {
        type: Object,
        required: true
      },
      type: {
        type: String,
        required: true
      },
      month: {
        type: Array,
        required: false
      },
      open: {
        type: Boolean,
        default: false
      },
      remove: {
        type: Boolean,
        default: false
      },
      edit: {
        type: Boolean,
        default: false
      }
    },

    data() {
      return {
        bill_highlight: false,
        bill_stay_highlighted: false,
        paycheck_highlight: false,
        paycheck_stay_highlighted: false,
        income_highlight: false,
        income_stay_highlighted: false,
        goal_highlight: false,
        goal_stay_highlighted: false,
      };
    },

    methods: {
      onBillHighlight(value, event) {
        this.bill_highlight = value;
      },
      onBillStayHighlighted(value, event) {
        this.bill_stay_highlighted = value;
      },
      onPaycheckHighlight(value, event) {
        this.paycheck_highlight = value;
      },
      onPaycheckStayHighlighted(value, event) {
        this.paycheck_stay_highlighted = value;
      },
      onHover(value) {
        if(this.type === 'bills') this.bill_highlight = value;
        if(this.type === 'paychecks') this.paycheck_highlight = value;
        if(this.type === 'incomes') this.income_highlight = value;
        if(this.type === 'goals') this.goal_highlight = value;
      },
    }
  }
</script>
