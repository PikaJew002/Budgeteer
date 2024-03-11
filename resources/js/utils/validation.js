function validationInputClasses(v) {
  
  return {
    'is-invalid': v.$invalid && !v.$pending,
    'is-valid': !v.$invalid && !v.$pending,
  };
}

function notZero(amount) {
  return (amount == '' || amount == null) || (Number(amount) > 0);
}

export {
  validationInputClasses,
  notZero,
};
