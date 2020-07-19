<template>
  <div id="vistor">
    <main class="py-4">
      <div class="container">
        <div class="jumbotron">
          <h1 class="display-4">Budgeteer</h1>
          <p class="lead">Welcome to Budgeteer! This web application is perfect for people looking for a great, lightweight application to help them get ahold of their finances.</p>
          <hr class="my-4">
          <p>We're glad you stopped by to check us out! If you'd like to take this app for a test-drive, go ahead and register. As this app is still in the testing phase, feel free to shoot us an email at budgeteer@ironmthome.com for access after registering.</p>
          <a class="btn btn-base btn-lg" href="/register" role="button">Register</a>
        </div>
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
    </main>
    <footer class="container py-4">
      <div class="inner text-center">
        <p>Site built by Aaron Eisenberg</p>
        <p>Direct inquiries to <a href="mailto:budgeteer@ironmthome.com">budgeteer@ironmthome.com</a></p>
      </div>
    </footer>
  </div>
</template>

<script>
  export default {
    beforeRouteLeave(to, from, next) {
      window.$('.collapse').collapse('hide');
      next();
    },
  }
</script>
