export function getServiceImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return "/placeholder.svg"
  if (imagePath.startsWith("http")) return imagePath
  if (imagePath.startsWith("/")) return imagePath
  return "/placeholder.svg"
}
