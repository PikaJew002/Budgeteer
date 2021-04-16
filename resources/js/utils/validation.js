function validationInputClasses(formInput) {
  return {
    'is-invalid': this.$v.paycheck[formInput].$invalid && !this.$v.paycheck[formInput].$pending,
    'is-valid': !this.$v.paycheck[formInput].$invalid && !this.$v.paycheck[formInput].$pending
  };
}

export { validationInputClasses };
