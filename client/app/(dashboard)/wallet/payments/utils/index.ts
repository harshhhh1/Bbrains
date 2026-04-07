export function getStatusColor(status: string) {
  switch (status) {
    case "completed":
      return "bg-brand-mint text-white";
    case "pending":
      return "bg-brand-yellow text-brand-orange";
    case "cancelled":
    case "failed":
      return "bg-destructive text-destructive-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
