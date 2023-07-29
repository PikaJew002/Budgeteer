<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">Reset Password</div>
          <div class="card-body">
            <template v-if="success">
                <div class="alert alert-success" role="alert">
                    {{ message }}
                </div>
            </template>
            <form v-else @submit.prevent="submit()">
              <div class="form-group row">
                <label for="email" class="col-md-4 col-form-label text-md-right">Email Address</label>

                <div class="col-md-6">
                  <input v-model="email" id="email" type="email" :class="['form-control', errors.email ? 'is-invalid' : '']" name="email" required autocomplete="email" autofocus>

                  <template v-if="errors.email">
                    <span v-for="error in errors.email" class="invalid-feedback" role="alert">
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

<script>
import UserAPI from '../api/user.js';
export default {
  data() {
    return {
      email: '',
      password: '',
      password_confirmation: '',
      errors: {},
      success: false,
      message: '',
    };
  },
  methods: {
    submit() {
      UserAPI.resetPassword(this.email, this.password, this.password_confirmation)
        .then((result) => {
          if(result.success) {
            this.message = result.message;
            this.success = result.success;
            this.errors = {};
            this.$router.push({ name: 'login' });
          } else {
            this.errors = { ...result.errors };
            this.success = result.success;
          }
        });
    },
  },
}
</script>