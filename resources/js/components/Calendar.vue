<template>
  <div id="calendar">
    <make-bill :show="bill.showMake" @open="bill.showMake = true" @close="bill.showMake = false"></make-bill>
    <modify-bill :show="bill.showModify" @open="bill.showModify = true" @close="bill.showModify = false"></modify-bill>
    <delete-bill :show="bill.showDelete" @open="bill.showDelete = true" @close="bill.showDelete = false"></delete-bill>
    <make-paycheck :show="paycheck.showMake" @open="paycheck.showMake = true" @close="paycheck.showMake = false"></make-paycheck>
    <modify-paycheck :show="paycheck.showModify" @open="paycheck.showModify = true" @close="paycheck.showModify = false"></modify-paycheck>
    <delete-paycheck :show="paycheck.showDelete" @open="paycheck.showDelete = true" @close="paycheck.showDelete = false"></delete-paycheck>
    <pair-paycheck :show="showPair" @open="showPair = true" @close="showPair = false"></pair-paycheck>
    <div class="row">
      <div class="col-sm-1">
        <button type="button" class="btn btn-secondary btn-lg btn-block h-100 d-inline-block" @click="monthDown()">❮</button>
      </div>
      <div class="col-sm-10">
        <div class="card-deck">
          <month v-for="index in month.months.length"
                :key="index - 1"
                :is-selected="index - 1 == selectedMonth"
                :month="month.months[index - 1][0]+1"
                :year="month.months[index - 1][1]"
                :incomesshown="incomes"
                :showmakebill="bill.showMake"
                :showmakepaycheck="paycheck.showMake">
          </month>
        </div>
      </div>
      <div class="col-sm-1">
        <button type="button" class="btn btn-secondary btn-lg btn-block h-100 d-inline-block" @click="monthUp()">❯</button>
      </div>
    </div>
  </div>
</template>

<style>
.month-test-enter-active, .month-leave-active {
  transition: all 1s;
}
.month-test-enter, .month-leave-to /* .list-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: translateY(100%, 0);
}
.month-test-move {
  transition: transform 1s;
}
</style>

<script>
  import Month from './Month.vue';
  import MakeBill from './bills/MakeBill.vue';
  import ModifyBill from './bills/ModifyBill.vue';
  import DeleteBill from './bills/DeleteBill.vue';
  import MakePaycheck from './paychecks/MakePaycheck.vue';
  import ModifyPaycheck from './paychecks/ModifyPaycheck.vue';
  import DeletePaycheck from './paychecks/DeletePaycheck.vue';
  import PairPaycheck from './paychecks/PairPaycheck.vue';
  import { cloneDeep } from 'lodash';
  import moment from 'moment';
  export default {
    components: {
      Month,
      'make-bill': MakeBill,
      'modify-bill': ModifyBill,
      'delete-bill': DeleteBill,
      'make-paycheck': MakePaycheck,
      'modify-paycheck': ModifyPaycheck,
      'delete-paycheck': DeletePaycheck,
      'pair-paycheck': PairPaycheck,
    },
    props: {
      totalMonths: {
        type: Number,
        default: function() {
          return 3;
        }
      },
      incomes: {
        type: Number,
        required: true
      },
      paychecks: {
        type: Array,
        default: function() {
          return [];
        }
      },
      bills: {
        type: Array,
        default: function() {
          return [];
        }
      }
    },
    data() {
      return {
        month: {
          months: []
        },
        nowMonth: [],
        bill: {
          showMake: false,
          showModify: false,
          showDelete: false
        },
        paycheck: {
          showMake: false,
          showModify: false,
          showDelete: false
        },
        showPair: false
      };
    },
    created() {
      this.nowMonth[0] = new Date(Date.now()).getMonth();
      this.nowMonth[1] = new Date(Date.now()).getFullYear();
      for(let i = 0; i < this.totalMonths; i++) {
        this.$set(this.month.months, i, this.indexToMonth(i, this.nowMonth));
      }
    },
    methods: {
      indexToMonth(index, curMonthArr) {
        let returnMonth = [curMonthArr[0] - this.selectedMonth + index, curMonthArr[1]];
        if(returnMonth[0] < 0) return [returnMonth[0] + 12, returnMonth[1] - 1];
        if(returnMonth[0] > 11) return [returnMonth[0] - 12, returnMonth[1] + 1];
        return returnMonth;
      },

      monthUp() {
        let newMonths = cloneDeep(this.month.months);
        for(let i = 0; i < newMonths.length - 1; i++) {
          newMonths[i] = newMonths[i+1];
        }
        if(newMonths[newMonths.length - 1][0] == 11) {
          newMonths[newMonths.length - 1] = [0, newMonths[newMonths.length - 1][1] + 1];
        } else {
          newMonths[newMonths.length - 1] = [newMonths[newMonths.length - 1][0] + 1, newMonths[newMonths.length - 1][1]];
        }
        this.month.months = newMonths;
      },

      monthDown() {
        let newMonths = cloneDeep(this.month.months);
        for(let i = newMonths.length - 1; i > 0; i--) {
          newMonths[i] = newMonths[i-1];
        }
        if(newMonths[0][0] == 0) {
          newMonths[0] = [11, newMonths[0][1] - 1];
        } else {
          newMonths[0] = [newMonths[0][0] - 1, newMonths[0][1]];
        }
        this.month.months = newMonths;
      }
    },
    computed: {
      selectedMonth() {
        return (this.totalMonths - 1) / 2;
      }
    }
  }
</script>
