<template>
  <div class="card-body">
    <div class="text-center">
      <h5 class="card-title">
        {{ goal.name }}
      </h5>
      <h6 class="card-subtitle mb-2 text-muted">
        ${{ Number(goal.amount).toFixed(2) }}
      </h6>
    </div>
    <div class="text-center mt-2">
      <button class="btn btn-outline-sub1 btn-sm" @click="onModify()">Edit</button>
    </div>
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
  
  import moment from 'moment';
  export default {
    props: {
      goal: {
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
        this.$eventBus.emit('modify-goal', this.goal);
      },
    },
  }
</script>
