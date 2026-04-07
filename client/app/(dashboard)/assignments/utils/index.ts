export function fmtDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function isImageFile(filename: string): boolean {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
  return imageExtensions.some((ext) => filename.toLowerCase().endsWith(ext))
}

export function getImageMimeType(filename: string): string {
  if (filename.toLowerCase().endsWith(".png")) return "image/png"
  if (filename.toLowerCase().endsWith(".gif")) return "image/gif"
  if (filename.toLowerCase().endsWith(".webp")) return "image/webp"
  return "image/jpeg"
}

export function getStatusBadgeVariant(status?: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status?.toLowerCase()) {
    case "graded":
    case "completed":
      return "default"
    case "submitted":
    case "pending":
      return "outline"
    case "overdue":
      return "destructive"
    default:
      return "secondary"
  }
}
