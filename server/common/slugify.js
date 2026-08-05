// Convert a string into a URL-safe slug: "Tech House Ltd." -> "tech-house-ltd"
const slugify = (str = "") =>
  str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

module.exports = { slugify };
