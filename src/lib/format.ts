export function formatTimestamp(value?: string | null) {
  if (!value) return "Unknown time";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function getInitials(name?: string | null, email?: string | null) {
  const cleanName = typeof name === "string" ? name.replace(/\s*\(.*\)\s*$/, "").trim() : "";
  if (cleanName) {
    const parts = cleanName.split(/\s+/).filter(Boolean);
    if (parts.length > 1) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email && email.length) return email.trim()[0].toUpperCase();
  return "U";
}
