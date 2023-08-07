<template>
  <div
    :class="['card', { 'border-base': shouldHighlight, 'shadow-lg': shouldHighlight }]"
    @mouseover="onHover(true)"
    @mouseleave="onHover(false)"
  >
    <ItemBill
      v-if="type === 'bill'"
      :bill="value"
      :month="month"
      :highlight="objHighlight.highlight"
      :open="open"
      :remove="remove"
      :edit="edit"
      @bill-highlight="onHighlight"
      @bill-stay-highlighted="onStayHighlighted"
    />
    <ItemPaycheck
      v-if="type === 'paycheck'"
      :highlight="objHighlight.highlight"
      :paycheck="value"
      :open="open"
      :remove="remove"
      :edit="edit"
      @paycheck-highlight="onHighlight"
      @paycheck-stay-highlighted="onStayHighlighted"
    />
    <ItemIncome
      v-if="type === 'income'"
      :highlight="objHighlight.highlight"
      :income="value"
      :open="open"
      :remove="remove"
      :edit="edit"
    />
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
export default {
  components: {
    ItemBill,
    ItemPaycheck,
    ItemIncome,
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
      income: {
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
