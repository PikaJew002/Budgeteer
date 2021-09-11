function validationInputClasses(v$, obj, attr) {
  return {
    'is-invalid': v$[obj][attr].$invalid && !v$[obj][attr].$pending,
    'is-valid': !v$[obj][attr].$invalid && !v$[obj][attr].$pending,
  };
}

function notZero(amount) {
  return (amount == "" || amount == null) || (Number(amount) > 0);
}

export {
  validationInputClasses,
  notZero,
};
