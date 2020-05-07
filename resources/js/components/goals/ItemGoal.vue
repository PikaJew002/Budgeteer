<template>
  <div class="card-body">
    <div class="text-center">
      <h5 class="card-title">
        {{ goal.name }}
      </h5>
      <h6 v-if="goal.amount != null" class="card-subtitle mb-2 text-muted">
        ${{ Number(goal.amount).toFixed(2) }}
      </h6>
    </div>
    <div v-if="highlight" class="text-center mt-2">
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
  import { EventBus } from '../../event-bus.js';
  import moment from 'moment';
  export default {
    props: {
      goal: {
        type: Object,
        required: true
      },
      highlight: {
        type: Boolean,
        required: true
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

      };
    },
    methods: {
      onModify() {
        EventBus.$emit('modify-goal', this.goal);
      }
    },
    computed: {
      thisMonth() {
        let monthStr = "" + this.month[1] + "-" + (this.month[0] > 9 ? this.month[0] : "0" + this.month[0]);
        return monthStr;
      }
    }
  }
</script>
