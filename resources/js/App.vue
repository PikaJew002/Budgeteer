<template>
  <div>
    <nav class="navbar navbar-expand-md navbar-dark bg-base shadow-sm">
      <div class="container-fluid">
        <router-link class="navbar-brand" :to="{ name: 'vistor' }">
          Budgeteer
        </router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div ref="collapse" class="collapse navbar-collapse" id="navbarSupportedContent">
          <!-- Left Side Of Navbar -->
          <ul class="navbar-nav mr-auto">
            <template v-if="isLoggedin">
              <li class="nav-item">
                <router-link class="nav-link" :to="{ name: 'home' }">Dashboard</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" :to="{ name: 'incomes' }">Incomes</router-link>
              </li>
            </template>
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
              <li class="nav-item">
                <a class="nav-link" href="#" @click.prevent="logout()">
                  Logout
                </a>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';

let collapse = ref(null);

let store = useStore();
let route = useRoute();
let router = useRouter();

let isLoggedin = computed(() => store.getters.getUserLoadStatus() === 2 && store.getters.getUser != null);

onMounted(() => {
  store.dispatch('loadUser');
  store.dispatch('setNavCollapse', collapse.value);
});

function logout() {
  store.dispatch('logoutUser').then(() => {
    if (route.name !== 'vistor') {
      router.push({ name: 'vistor' });
    }
  });
}
</script>