// At least 8 characters, with at least one letter and one number.
const isStrongPassword = (password) => {
  if (!password || typeof password !== "string") return false;
  if (password.length < 8) return false;
  return /[A-Za-z]/.test(password) && /\d/.test(password);
};

module.exports = { isStrongPassword };
