export function canEditNews(role: string) {
  return [
    "deus_admin",
    "admin",
  ].includes(role);
}