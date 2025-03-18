import type { SVGProps } from "react";
import { cn } from "~/utils/cn";
import spriteHref from "./icons/icon.svg";
import type { IconName } from "./icons/icons";

export function Icon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & {
  name: IconName;
}) {
  return (
    <svg {...props} className={cn("w-full h-full", props.className)}>
      <title>{name}</title>
      <use href={`${spriteHref}#${name}`} />
    </svg>
  );
}
