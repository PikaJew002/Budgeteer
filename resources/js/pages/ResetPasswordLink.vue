<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">Reset Password</div>

          <div class="card-body">
            <form @submit.prevent="submit()">

              <input type="hidden" name="token" :value="$route.params.token">

              <div class="form-group row">
                <label for="email" class="col-md-4 col-form-label text-md-right">Email Address</label>

                <div class="col-md-6">
                  <input v-model="email" id="email" type="email" :class="['form-control', errors.email ? 'is-invalid' : '']" required autocomplete="email" autofocus>

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
                  <input v-model="password" id="password" type="password" :class="['form-control', errors.password ? 'is-invalid' : '']" required autocomplete="new-password">

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
                  <input id="password-confirm" type="password" :class="['form-control', errors.password_confirmation ? 'is-invalid' : '']" required autocomplete="new-password">

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

<script>
export default {
  data() {
    return {
      email: this.$route.query.email,
      password: '',
      password_confirmation: '',
      errors: {},
      success: false,
      message: '',
    };
  },
  methods: {
    submit() {
      UserAPI.emailResetPasswordLink(this.email)
        .then((result) => {
          if (result.success) {
            this.message = result.message;
            this.success = result.success;
            this.errors.email = null;
            this.$router.push({ name: 'login', query: { message: 'Your password has been reset. Please login again.' } });
          } else {
            this.errors = { ...result.errors };
            this.success = result.success;
          }
        });
    },
  }
}
</script>