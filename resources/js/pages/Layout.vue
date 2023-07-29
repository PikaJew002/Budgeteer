<template>
  <div>
    <nav class="navbar navbar-expand-md navbar-dark bg-base shadow-sm">
      <div class="container-fluid">
        <router-link class="navbar-brand" :to="{ name: 'vistor' }">
          Budgeteer
        </router-link>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <!-- Left Side Of Navbar -->
          <ul class="navbar-nav mr-auto">
              <template v-if="isLoggedin">
                  <li class="nav-item">
                      <router-link class="nav-link" :to="{ name: 'home' }">Dashboard</router-link>
                  </li>
                  <li class="nav-item">
                      <router-link class="nav-link" :to="{ name: 'incomes' }">Incomes</router-link>
                  </li>
                  <li class="nav-item">
                      <router-link class="nav-link" :to="{ name: 'goals' }">Goals</router-link>
                  </li>
              </template>
          </ul>

          <!-- Right Side Of Navbar -->
          <ul class="navbar-nav ml-auto">
            <!-- Authentication Links -->
            <template v-if="!isLoggedin">
              <li class="nav-item">
                <router-link :to="{ name: 'login' }" class="nav-link">Login</router-link>
              </li>
              <li class="nav-item">
                <router-link :to="{ name: 'register' }" class="nav-link">Register</router-link>
              </li>
            </template>
            <template v-else>
              <li class="nav-item dropdown">
                <a id="navbarDropdown" class="nav-link dropdown-toggle" href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  {{ userName }} <span class="caret"></span>
                </a>

                <div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
                  <a class="dropdown-item" href="#" @click.prevent="logout()">
                    Logout
                  </a>
                </div>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: this.$store.getters.getUser,
    };
  },
  methods: {
    logout() {
      this.$store.dispatch('logoutUser').then(() => {
        if(this.$route.name !== 'vistor') {
          this.$router.push({ name: 'vistor' });
        }
      });
    },
  },
  computed: {
    isLoggedin() {
      return this.$store.getters.getUserLoadStatus() === 2 && this.$store.getters.getUser != null;
    },
    userName() {
      return this.$store.getters.getUser.name;
    },
  },
}
</script>