const formatearNumero = (numero) => {
  const formatter = new Intl.NumberFormat("en-HN", {
    minimumFractionDigits: 2,
  });
  return formatter.format(numero);
};

const textValidator = (value) => {
  if (value === undefined || value === null || value === "") {
    return false;
  } else {
    return true;
  }
};

module.exports = {
  formatearNumero,
  textValidator,
};
