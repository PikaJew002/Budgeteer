<template>
  <main class="py-4">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card border-base">
            <div class="card-header">{{ !success ? 'Register' : 'Registration Complete' }}</div>
            <div class="card-body">
              <template v-if="success">
                <div class="alert alert-success" role="alert">
                  You have been successfully registered. You will be able to login once your account has been approved by an admin. You will get an email when your account has been approved.
                </div>
              </template>
              <form v-else @submit.prevent="register()">
                <div class="form-group row">
                  <label for="name" class="col-md-4 col-form-label text-md-right">Name</label>

                  <div class="col-md-6">
                    <input v-model="name" id="name" type="text" :class="['form-control', errors.name ? 'is-invalid' : '']" name="name" required autocomplete="name" autofocus>

                    <template v-if="errors.name">
                      <span v-for="error in errors.name" class="invalid-feedback" role="alert">
                        <strong>{{ error }}</strong>
                      </span>
                    </template>
                  </div>
                </div>

                <div class="form-group row">
                  <label for="email" class="col-md-4 col-form-label text-md-right">Email Address</label>

                  <div class="col-md-6">
                    <input v-model="email" id="email" type="email" :class="['form-control', errors.email ? 'is-invalid' : '']" name="email" required autocomplete="email">

                    <template v-if="errors.email">
                      <span v-for="error in errors.email" class="invalid-feedback" role="alert">
                        <strong>{{ error }}</strong>
                      </span>
                    </template>
                  </div>
                </div>

                <div class="form-group row">
                  <label for="password" class="col-md-4 col-form-label text-md-right">Password</label>

                  <div class="col-md-6">
                    <input id="password" type="password" :class="['form-control', errors.password ? 'is-invalid' : '']" name="password" required autocomplete="new-password">

                    <template v-if="errors.password">
                      <span v-for="error in errors.password" class="invalid-feedback" role="alert">
                        <strong>{{ error }}</strong>
                      </span>
                    </template>
                  </div>
                </div>

                <div class="form-group row">
                  <label for="password-confirm" class="col-md-4 col-form-label text-md-right">Confirm Password</label>

                  <div class="col-md-6">
                    <input v-model="password_confirmation" id="password-confirm" type="password" :class="['form-control', errors.password_confirmation ? 'is-invalid' : '']" name="password_confirmation" required autocomplete="new-password">

                    <template v-if="errors.password_confirmation">
                      <span v-for="error in errors.password_confirmation" class="invalid-feedback" role="alert">
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

<script>
import UserAPI from '../api/user.js';
export default {
  data() {
    return {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      success: false,
      errors: {},
    };
  },
  methods: {
    register() {
      UserAPI.register(this.name, this.email, this.password, this.password_confirmation)
        .then((result) => {
          if(result.success) {
            this.name = '';
            this.email = '';
            this.password = '';
            this.password_confirmation = '';
          }
          this.success = result.success;
          this.errors = { ...result.errors };
        });
    },
  },
}
</script>