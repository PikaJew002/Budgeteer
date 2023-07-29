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
                    <input v-model="password" id="password" type="password" :class="['form-control', errors.password ? 'is-invalid' : '']" required autocomplete="current-password">

                    <template v-if="errors.password">
                      <span v-for="error in errors.password" class="invalid-feedback" role="alert">
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

<script>
export default {
  data() {
    return {
      email: '',
      password: '',
      remember: false,
      errors: {},
    };
  },
  methods: {
    login() {
      this.$store.dispatch('loginUser', {
        email: this.email,
        password: this.password,
        remember: this.remember,
      }).then((result) => {
        if(result.success) {
          this.$router.push({ name: 'home' });
        } else {
          this.errors = { ...result.errors };
        }
      });
    },
  },
  beforeRouteLeave(to, from, next) {
    window.$('.collapse').collapse('hide');
    next();
  },
}
</script>
