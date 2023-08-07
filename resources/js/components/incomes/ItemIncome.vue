<template>
  <div class="card-body">
    <div class="text-center">
      <h5 class="card-title">
        {{ income.name }}
      </h5>
    </div>
    <div class="text-center mt-2">
      <button class="btn btn-outline-sub1 btn-sm" @click="onModify()">Edit</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    income: {
      type: Object,
      required: true,
    },
    highlight: {
      type: Boolean,
      required: true,
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
  methods: {
    onModify() {
      this.$eventBus.emit('modify-income', this.income);
    },
  },
}
</script>
