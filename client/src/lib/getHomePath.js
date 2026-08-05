// Resolve the correct landing path for an authenticated user.
// Super admins go to the global companies panel; tenant users go to their slug home.
export const getHomePath = () => {
  const role = localStorage.getItem("role");
  const slug = localStorage.getItem("slug");
  if (role === "superadmin") return "/companies";
  if (slug) return `/${slug}`;
  return "/";
};
