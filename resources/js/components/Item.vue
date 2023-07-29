<template>
  <div class="card"
       id="item"
       :class="{ 'border-base': shouldHighlight, 'shadow-lg': shouldHighlight, }"
       @mouseover="onHover(true)"
       @mouseleave="onHover(false)">
    <item-bill v-if="type === 'bill'"
               :bill="value"
               :month="month"
               :highlight="objHighlight.highlight"
               :open="open"
               :remove="remove"
               :edit="edit"
               @bill-highlight="onHighlight"
               @bill-stay-highlighted="onStayHighlighted">
    </item-bill>
    <item-contribution v-if="type === 'contribution'"
                       :contribution="value"
                       :month="month"
                       :highlight="objHighlight.highlight"
                       :open="open"
                       :remove="remove"
                       :edit="edit"
                       @contribution-highlight="onHighlight"
                       @contribution-stay-highlighted="onStayHighlighted"></item-contribution>
     <item-paycheck v-if="type === 'paycheck'"
                    :highlight="objHighlight.highlight"
                    :paycheck="value"
                    :open="open"
                    :remove="remove"
                    :edit="edit"
                    @paycheck-highlight="onHighlight"
                    @paycheck-stay-highlighted="onStayHighlighted"></item-paycheck>
     <item-income v-if="type === 'income'"
                  :highlight="objHighlight.highlight"
                  :income="value"
                  :open="open"
                  :remove="remove"
                  :edit="edit"></item-income>
     <item-goal v-if="type === 'goal'"
                :highlight="objHighlight.highlight"
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
  import ItemBill from './bills/ItemBill.vue';
  import ItemPaycheck from './paychecks/ItemPaycheck.vue';
  import ItemIncome from './incomes/ItemIncome.vue';
  import ItemGoal from './goals/ItemGoal.vue';
  import ItemContribution from './contributions/ItemContribution.vue';
  export default {
    components: {
      'item-bill': ItemBill,
      'item-paycheck': ItemPaycheck,
      'item-income': ItemIncome,
      'item-goal': ItemGoal,
      'item-contribution': ItemContribution,
    },
    props: {
      value: {
        type: Object,
        required: true,
      },
      type: {
        type: String,
        required: true,
      },
      month: {
        type: Array,
        required: false,
      },
      open: {
        type: Boolean,
        default: false,
      },
      remove: {
        type: Boolean,
        default: false,
      },
      edit: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        bill: {
          highlight: false,
          stayHighlighted: false,
        },
        paycheck: {
          highlight: false,
          stayHighlighted: false,
        },
        contribution: {
          highlight: false,
          stayHighlighted: false,
        },
        income: {
          highlight: false,
          stayHighlighted: false,
        },
        goal: {
          highlight: false,
          stayHighlighted: false,
        },
      };
    },
    methods: {
      onHighlight(value, event) {
        this[value[1]].highlight = value[0];
      },
      onStayHighlighted(value, event) {
        this[value[1]].stayHighlighted = value[0];
      },
      onHover(value) {
        this[this.type].highlight = value;
      },
    },
    computed: {
      shouldHighlight() {
        return this[this.type].highlight || this[this.type].stayHighlighted;
      },
      objHighlight() {
        return this[this.type];
      },
    },
  }
</script>
