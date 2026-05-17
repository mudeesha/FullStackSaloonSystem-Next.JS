import Image from "next/image"
import { getServiceImageUrl } from "@/lib/image-url"
import { cn } from "@/lib/utils"

type UserAvatarProps = {
  name: string
  profileImage?: string | null
  className?: string
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function UserAvatar({ name, profileImage, className }: UserAvatarProps) {
  const src = getServiceImageUrl(profileImage)
  const hasImage = profileImage && profileImage !== "/placeholder.svg"

  return (
    <div
      className={cn(
        "relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted",
        className,
      )}
    >
      {hasImage ? (
        <Image src={src} alt={name} fill className="object-cover" sizes="56px" />
      ) : (
        <span className="text-sm font-semibold text-muted-foreground">{getInitials(name)}</span>
      )}
    </div>
  )
}
