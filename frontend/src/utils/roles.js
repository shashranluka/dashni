// ბრუნებს მომხმარებლის როლს სერვერიდან მოსული role სვეტიდან.
// fallback — "user", თუ user null-ია ან role ველი არ არის.
export const resolveRoleFromUser = (user) => {
  if (!user || typeof user !== "object") return "user";
  if (typeof user.role === "string" && user.role.trim()) return user.role.trim().toLowerCase();
  return "user";
};

// ამოწმებს, არის თუ არა მომხმარებელი ადმინი.
export const isAdminUser = (user) => resolveRoleFromUser(user) === "admin";

// ამოწმებს, აქვს თუ არა მომხმარებელს editor-ის წვდომა.
// admin-ი editor-ის ყველა წვდომასაც ფლობს, ამიტომ ორივე role ბრუნდება true-თი.
export const isEditorUser = (user) => {
  const r = resolveRoleFromUser(user);
  return r === "editor" || r === "admin";
};
