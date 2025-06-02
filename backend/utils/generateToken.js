// backend/utils/generateToken.js
const jwt = require("jsonwebtoken"); // Importa 'jsonwebtoken' aquí

const generateToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1h", // El token expirará en 1 hora
  });

  return token;
};

module.exports = generateToken; // Exporta directamente la función
