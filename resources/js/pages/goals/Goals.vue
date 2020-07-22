<template>
  <main class="py-4">
    <div id="goals" class="container-fluid">
      <make-contribution :show="showMakeContribution"
                         @open="showMakeContribution = true"
                         @close="showMakeContribution = false"></make-contribution>
      <modify-contribution :show="showModifyContribution"
                           @open="showModifyContribution = true"
                           @close="showModifyContribution = false"></modify-contribution>
      <modify-contribution-confirm :show="showModifyContributionConfirm"
                                   @open="showModifyContributionConfirm = true"
                                   @close="showModifyContributionConfirm = false"></modify-contribution-confirm>
      <delete-contribution :show="showDeleteContribution"
                           @open="showDeleteContribution = true"
                           @close="showDeleteContribution = false"></delete-contribution>
      <make-goal :show="showMake"
                 @open="showMake = true"
                 @close="showMake = false"></make-goal>
      <modify-goal :show="showModify"
                   @open="showModify = true"
                   @close="showModify = false"></modify-goal>
      <modify-goal-confirm :show="showModifyConfirm"
                           @open="showModifyConfirm = true"
                           @close="showModifyConfirm = false"></modify-goal-confirm>
      <delete-goal :show="showDelete"
                   @open="showDelete = true"
                   @close="showDelete = false"></delete-goal>
      <div class="d-flex justify-content-between">
        <h3>Goals</h3>
        <button type="button" class="btn btn-outline-base" @click="makeGoal()">+</button>
      </div>
      <hr>
      <collection :items="goals"
                  :allowSizeChange="true"
                  type="goal"
                  :size="3"></collection>
    </div>
  </main>
</template>

<style>
  .bg-white-50 {
    background: rgb(255, 255, 255, 0.75);
  }
  .bg-smokewhite-100 {
    background: rgb(247, 247, 247, 1);
  }
</style>

<script>
  import Collection from '../../components/Collection.vue';
  import MakeContribution from '../../components/contributions/MakeContribution.vue';
  import ModifyContribution from '../../components/contributions/ModifyContribution.vue';
  import ModifyContributionConfirm from '../../components/contributions/ModifyContributionConfirm.vue';
  import DeleteContribution from '../../components/contributions/DeleteContribution.vue';
  import MakeGoal from '../../components/goals/MakeGoal.vue';
  import ModifyGoal from '../../components/goals/ModifyGoal.vue';
  import ModifyGoalConfirm from '../../components/goals/ModifyGoalConfirm.vue';
  import DeleteGoal from '../../components/goals/DeleteGoal.vue';
  import { EventBus } from '../../event-bus.js';
  export default {
    components: {
      Collection,
      'make-contribution': MakeContribution,
      'modify-contribution': ModifyContribution,
      'modify-contribution-confirm': ModifyContributionConfirm,
      'delete-contribution': DeleteContribution,
      'make-goal': MakeGoal,
      'modify-goal': ModifyGoal,
      'modify-goal-confirm': ModifyGoalConfirm,
      'delete-goal': DeleteGoal,
    },
    data() {
      return {
        showMakeContribution: false,
        showModifyContribution: false,
        showModifyContributionConfirm: false,
        showDeleteContribution: false,
        showMake: false,
        showModify: false,
        showModifyConfirm: false,
        showDelete: false,
      };
    },
    created() {
      if(this.goalsLoadStatus < 2) {
        this.$store.dispatch('loadGoals', {
          with: ['contributions.paychecks'],
        });
      }
      if(this.goalsLoadStatus < 2) {
        this.$store.dispatch('loadIncomes', {
          with: ['paychecks.bills', 'paychecks.contributions'],
        });
      }
    },
    methods: {
      makeGoal() {
        EventBus.$emit('make-goal');
      },
    },
    computed: {
      goals() {
        return this.$store.getters.getGoals;
      },
      goalsLoadStatus() {
        return this.$store.getters.getGoalsLoadStatus;
      },
      incomesLoadStatus() {
        return this.$store.getters.getIncomesLoadStatus;
      },
    },
    beforeRouteLeave(to, from, next) {
      window.$('.collapse').collapse('hide');
      next();
    },
  }
</script>
