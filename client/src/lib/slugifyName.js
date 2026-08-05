// Build a URL-safe "first-last" slug from a user's name for readable profile URLs.
export const slugifyName = (firstName, lastName) =>
  [firstName, lastName]
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
