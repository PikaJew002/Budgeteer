<template>
  <main class="py-4">
    <div id="goals" class="container-fluid">
      <make-contribution :show="showMakeContribution"
                         @open="showMakeContribution = true"
                         @close="showMakeContribution = false"></make-contribution>
      <make-goal :show="showMake"
                    @open="showMake = true"
                    @close="showMake = false"></make-goal>
      <modify-goal :show="showModify"
                    @open="showModify = true"
                    @close="showModify = false"></modify-goal>
      <delete-goal :show="showDelete"
                    @open="showDelete = true"
                    @close="showDelete = false"></delete-goal>
      <div class="d-flex justify-content-between">
        <h3>Goals</h3>
        <button type="button" class="btn btn-outline-base" @click="makeGoal()">+</button>
      </div>
      <hr>
      <collection :items="goals"
                  type="goals"
                  :size="3"></collection>
    </div>
  </main>
</template>

<script>
  import Collection from '../../components/Collection.vue';
  import MakeContribution from '../../components/contributions/MakeContribution.vue';
  import MakeGoal from '../../components/goals/MakeGoal.vue';
  import ModifyGoal from '../../components/goals/ModifyGoal.vue';
  import DeleteGoal from '../../components/goals/DeleteGoal.vue';
  import { EventBus } from '../../event-bus.js';
  export default {
    components: {
      Collection,
      'make-contribution': MakeContribution,
      'make-goal': MakeGoal,
      'modify-goal': ModifyGoal,
      'delete-goal': DeleteGoal,
    },
    data() {
      return {
        showMakeContribution: false,
        showMake: false,
        showModify: false,
        showDelete: false,
      };
    },
    created() {
      this.$store.dispatch('loadGoals');
    },
    methods: {
      makeGoal() {
        EventBus.$emit('make-goal');
      }
    },
    computed: {
      goals() {
        return this.$store.getters.getGoals;
      },
    },
  }
</script>
