const Company = require("../models/Company");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { slugify } = require("./slugify");

const SETUP_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

// Create a company whose slug is guaranteed unique (appends -2, -3, ...).
// `session` is optional (transaction). Mongoose requires an ARRAY first
// argument when passing options, so branch on session presence.
const createCompanyWithUniqueSlug = async (data, session) => {
  const baseSlug = slugify(data.name) || "company";
  let slug = baseSlug;
  let counter = 2;
  while (await Company.exists({ slug })) {
    slug = `${baseSlug}-${counter++}`;
  }
  const created = session
    ? await Company.create([{ ...data, slug }], { session })
    : await Company.create({ ...data, slug });
  return Array.isArray(created) ? created[0] : created;
};

// Create a user with a one-time setup token (random bcrypt password they
// replace via the emailed link). `session` is optional (transaction).
const createUserWithSetupToken = async (data, session) => {
  const setupToken = crypto.randomBytes(32).toString("hex");
  const user = new User({
    password: await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 10),
    setupToken,
    setupTokenExpires: new Date(Date.now() + SETUP_TOKEN_TTL_MS),
    ...data,
  });
  await user.save({ session });
  return { user, setupToken };
};

const setupLinkFor = (token) =>
  `${process.env.FRONTEND_URL || "http://localhost:5173"}/setup/${token}`;

module.exports = {
  SETUP_TOKEN_TTL_MS,
  createCompanyWithUniqueSlug,
  createUserWithSetupToken,
  setupLinkFor,
};
