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
                <a id="navbarDropdown" class="nav-link dropdown-toggle" href="#" role="button"
                  data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
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

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';

let collapse = ref(null);

let store = useStore();
let route = useRoute();
let router = useRouter();

let isLoggedin = computed(() => store.getters.getUserLoadStatus() === 2 && store.getters.getUser != null);

let userName = computed(() => store.getters.getUser.name);

onMounted(() => {
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