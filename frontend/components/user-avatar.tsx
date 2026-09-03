import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/auth/use-session"

type UserAvatarProps = {
  name: string
  /** Absolute URL the API returns for the uploaded profile picture. */
  src?: string | null
  size?: "default" | "sm" | "lg"
  className?: string
}

/**
 * Profiles may carry a picture, but most do not. The fallback colours the
 * initials circle from the name so a person stays recognisable across offers
 * and reviews without storing anything extra.
 */
function hueFor(value: string): number {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 360
  }
  return hash
}

export function UserAvatar({
  name,
  src,
  size = "default",
  className,
}: UserAvatarProps) {
  return (
    <Avatar size={size} className={className} title={name}>
      {src ? <AvatarImage src={src} alt="" /> : null}
      <AvatarFallback
        className="font-semibold text-background"
        style={{ backgroundColor: `oklch(0.72 0.12 ${hueFor(name)})` }}
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}
