<template>
  <main class="py-4">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card border-base">
            <div class="card-header">
              Login
            </div>
            <div class="card-body">
              <template v-if="$route.query.message">
                  <div class="alert alert-success" role="alert">
                      {{ $route.query.message }}
                  </div>
              </template>
              <form @submit.prevent="login()">

                <div class="form-group row">
                  <label for="email" class="col-md-4 col-form-label text-md-right">Email Address</label>

                  <div class="col-md-6">
                    <input v-model="email" id="email" type="email" :class="['form-control', errors.all.email ? 'is-invalid' : '']" required autocomplete="email" autofocus>

                    <template v-if="errors.all.email">
                      <span v-for="error in errors.all.email" class="invalid-feedback" role="alert">
                        <strong>{{ error }}</strong>
                      </span>
                    </template>
                  </div>
                </div>

                <div class="form-group row">
                  <label for="password" class="col-md-4 col-form-label text-md-right">Password</label>

                  <div class="col-md-6">
                    <input v-model="password" id="password" type="password" :class="['form-control', errors.all.password ? 'is-invalid' : '']" required autocomplete="current-password">

                    <template v-if="errors.all.password">
                      <span v-for="error in errors.all.password" class="invalid-feedback" role="alert">
                        <strong>{{ error }}</strong>
                      </span>
                    </template>
                  </div>
                </div>

                <div class="form-group row">
                  <div class="col-md-6 offset-md-4">
                    <div class="form-check">
                      <input v-model="remember" class="form-check-input" type="checkbox" id="remember">

                      <label class="form-check-label" for="remember">
                        Remember Me
                      </label>
                    </div>
                  </div>
                </div>

                <div class="form-group row mb-0">
                  <div class="col-md-8 offset-md-4">
                    <button type="submit" class="btn btn-base">
                      Login
                    </button>
                    <router-link class="btn btn-link text-base" :to="{ name: 'reset-password' }">
                      Forgot Your Password?
                    </router-link>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter, onBeforeRouteLeave } from 'vue-router';

let email = ref('');
let password = ref('');
let remember = ref(false);

let errors = reactive({
  all: {},
});

let store = useStore();
let router = useRouter();

let collapse = computed(() => {
  return store.getters.getNavCollapse;
});

function login() {
  store.dispatch('loginUser', {
    email: email.value,
    password: password.value,
    remember: remember.value,
  }).then((result) => {
    if (result.success) {
      router.push({ name: 'home' });
    } else {
      errors.all = { ...result.errors };
    }
  });
}

onBeforeRouteLeave(() => {
  collapse.value.hide();
});
</script>
