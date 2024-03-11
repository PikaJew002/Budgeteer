<template>
  <main class="py-4">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card border-base">
            <div class="card-header">{{ !response.success ? 'Register' : 'Registration Complete' }}</div>
            <div class="card-body">
              <template v-if="response.success">
                <div class="alert alert-success" role="alert">
                  You have been successfully registered. You will be able to login once your account has been approved by an admin. You will get an email when your account has been approved.
                </div>
              </template>
              <form v-else @submit.prevent="register()">
                <div class="form-group row">
                  <label for="name" class="col-md-4 col-form-label text-md-right">Name</label>

                  <div class="col-md-6">
                    <input v-model="form.name" id="name" type="text" :class="['form-control', response.errors.name ? 'is-invalid' : '']" name="name" required autocomplete="name" autofocus>

                    <template v-if="response.errors.name">
                      <span v-for="error in response.errors.name" class="invalid-feedback" role="alert">
                        <strong>{{ error }}</strong>
                      </span>
                    </template>
                  </div>
                </div>

                <div class="form-group row">
                  <label for="email" class="col-md-4 col-form-label text-md-right">Email Address</label>

                  <div class="col-md-6">
                    <input v-model="form.email" id="email" type="email" :class="['form-control', response.errors.email ? 'is-invalid' : '']" name="email" required autocomplete="email">

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
                    <input v-model="form.password" id="password" type="password" :class="['form-control', response.errors.password ? 'is-invalid' : '']" name="password" required autocomplete="new-password">

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
                    <input v-model="form.password_confirmation" id="password-confirm" type="password" :class="['form-control', response.errors.password_confirmation ? 'is-invalid' : '']" name="password_confirmation" required autocomplete="new-password">

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
                      Register
                    </button>
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
import { reactive } from 'vue';
import UserAPI from '../api/user.js';

let form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
});

let response = reactive({
  success: false,
  errors: {},
});

function register() {
  UserAPI.register(form.name, form.email, form.password, form.password_confirmation)
    .then((result) => {
      if (result.success) {
        form.name = '';
        form.email = '';
        form.password = '';
        form.password_confirmation = '';
      }
      response.success = result.success;
      response.errors = { ...result.errors };
    });
}
</script>