<template>
  <div id="vistor">
    <main class="py-4">
      <div class="container">
        <div class="p-5 mb-4 bg-cardbg rounded-3">
          <div class="container-fluid py5">
            <h1 class="display-5 fw-bold">Budgeteer</h1>
            <p class="col-md-8 fs-4">This web application is perfect for people looking for a great, lightweight application to help them get ahold of their finances.</p>
            <hr class="my-4">
            <p>
              We're glad you stopped by to check us out! If you'd like to take this app for a test-drive, go ahead and register.
              After registering, we'll be notified, an admin will approve your account, and you'll get an email with a few instructions to get the most out of Budgeteer as documentation is still in the works.
            </p>
            <router-link class="btn btn-base btn-lg" :to="{ name: 'register' }">Register</router-link>
          </div>
        </div>
        <div class="card bg-cardbg border-cardbg">
          <div class="card-body m-2">
            <h3>The Problem</h3>
            <p>
              This app seeks to solve a well known problem among people who are paid on
              a bi-weekly schedule: monthly bills, but not monthly paychecks.<br>
              Most budgetting apps don't let you define bi-weekly paychecks.<br>
            </p>
            <hr>
            <h3>The Solution</h3>
            <p>
              Enter Budgeteer. Budgeteer gives you the flexibility to specify when you
              get paid and do projections on bills and paychecks. Then create associations.<br>
              That is, "pair" bills and paychecks together so that every paycheck you know what
              has to go to bills and what is left over.
            </p>
            <hr>
            <h3>Other Notes</h3>
            <p>
              Unlike other heavyweight budgetting apps, Budgeteer doesn't track expenses for you.
              That's beyond the scope of the problem that Budgeteer seeks to solve.
              Rather than try to solve a huge problem mediocrely, we seek to solve a smaller problem exceptionally.
              Just bills and paychecks.
            </p>
          </div>
        </div>
      </div>
    </main>
    <footer class="footer mt-auto py-4 bg-base text-navtext">
      <div class="inner text-center">
        <p>Site built by Aaron Eisenberg</p>
        <p>Direct inquiries to <a href="mailto:budgeteer@ironmthome.com">budgeteer@ironmthome.com</a></p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { onBeforeRouteLeave } from 'vue-router';

let store = useStore();

let collapse = computed(() => {
  return store.getters.getNavCollapse;
});

onBeforeRouteLeave(() => {
  collapse.value.hide();
});
</script>
