<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">Reset Password</div>
          <div class="card-body">
            <template v-if="response.success">
                <div class="alert alert-success" role="alert">
                    {{ response.message }}
                </div>
            </template>
            <form v-else @submit.prevent="submit()">
              <div class="form-group row">
                <label for="email" class="col-md-4 col-form-label text-md-right">Email Address</label>

                <div class="col-md-6">
                  <input v-model="form.email" id="email" type="email" :class="['form-control', response.errors.email ? 'is-invalid' : '']" name="email" required autocomplete="email" autofocus>

                  <template v-if="response.errors.email">
                    <span v-for="error in response.errors.email" class="invalid-feedback" role="alert">
                      <strong>{{ error }}</strong>
                    </span>
                  </template>
                </div>
              </div>

              <div class="form-group row">
                <label for="password" class="col-md-4 col-form-label text-md-right">Password</label>

                <div class="col-md-6">
                  <input v-model="form.password" id="password" type="password" :class="['form-control', response.errors.password ? 'is-invalid' : '']" required autocomplete="new-password">

                  <template v-if="response.errors.password">
                    <span v-for="error in response.errors.password" class="invalid-feedback" role="alert">
                      <strong>{{ error }}</strong>
                    </span>
                  </template>
                </div>
              </div>

              <div class="form-group row">
                <label for="password-confirm" class="col-md-4 col-form-label text-md-right">Confirm Password</label>

                <div class="col-md-6">
                  <input v-model="form.password_confirmation" id="password-confirm" type="password" :class="['form-control', response.errors.password_confirmation ? 'is-invalid' : '']" required autocomplete="new-password">

                  <template v-if="response.errors.password_confirmation">
                    <span v-for="error in response.errors.password_confirmation" class="invalid-feedback" role="alert">
                      <strong>{{ error }}</strong>
                    </span>
                  </template>
                </div>
              </div>

              <div class="form-group row mb-0">
                <div class="col-md-6 offset-md-4">
                  <button type="submit" class="btn btn-base">
                    Reset Password
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
import { useRouter } from 'vue-router';
import UserAPI from '../api/user.js';

let router = useRouter();

let form = reactive({
  email: '',
  password: '',
  password_confirmation: '',
});

let response = reactive({
  success: false,
  errors: {},
  message: '',
});

function submit() {
  UserAPI.resetPassword(form.email, form.password, form.password_confirmation)
    .then((result) => {
      if (result.success) {
        response.message = result.message;
        response.success = result.success;
        response.errors = {};
        router.push({ name: 'login' });
      } else {
        response.errors = { ...result.errors };
        response.success = result.success;
      }
    });
}
</script>