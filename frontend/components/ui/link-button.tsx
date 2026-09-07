import Link from "next/link"

import { Button } from "@/components/ui/button"

type LinkButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "render" | "nativeButton"
> & {
  href: string
}

/**
 * A button-shaped link.
 *
 * Base UI's Button assumes a native <button> and warns when the render prop
 * produces something else, because an <a> loses the form and keyboard
 * behaviour a button carries. Turning that assumption off here keeps the
 * anchor semantics - open in a new tab, copy link - and stops every call
 * site from having to remember the flag.
 */
export function LinkButton({ href, ...props }: LinkButtonProps) {
  return (
    <Button nativeButton={false} render={<Link href={href} />} {...props} />
  )
}
