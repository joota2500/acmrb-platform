export function isDeusAdmin(
  role?: string,
) {
  return role === "deus_admin";
}

export function isAdmin(
  role?: string,
) {
  return (
    role === "deus_admin" ||
    role === "admin_operacional"
  );
}

export function isModerator(
  role?: string,
) {
  return (
    role === "moderador" ||
    role === "admin_operacional" ||
    role === "deus_admin"
  );
}