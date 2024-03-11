<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">Reset Password</div>

          <div class="card-body">
            <form @submit.prevent="submit()">

              <input type="hidden" name="token" :value="route.params.token">

              <div class="form-group row">
                <label for="email" class="col-md-4 col-form-label text-md-right">Email Address</label>

                <div class="col-md-6">
                  <input v-model="form.email" id="email" type="email" :class="['form-control', response.errors.email ? 'is-invalid' : '']" required autocomplete="email" autofocus>

                  <template v-if="response.errors.email">
                    <span v-for="error in response.errors.email" class="invalid-feedback" role="alert">
                      <strong>{{ error }}</strong>
                    </span>
                  </template>
                </div>
              </div>

              <div class="form-group row mb-0">
                <div class="col-md-6 offset-md-4">
                  <button type="submit" class="btn btn-base">
                    Send Password Reset Link
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import UserAPI from '../api/user.js';

let router = useRouter();

let route = useRoute();

let form = reactive({
  email: route.query.email,
});

let response = reactive({
  success: false,
  errors: {},
  message: '',
});

function submit() {
  UserAPI.emailResetPasswordLink(form.email)
    .then((result) => {
      if (result.success) {
        response.message = result.message;
        response.success = result.success;
        response.errors.email = null;
        router.push({ name: 'login', query: { message: 'Your password has been reset. Please login again.' } });
      } else {
        response.errors = { ...result.errors };
        response.success = result.success;
      }
    });
}
</script>