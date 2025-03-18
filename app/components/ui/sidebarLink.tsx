import type { ReactNode } from "react";
import { NavLink } from "react-router";
import { cn } from "~/utils/cn";

export function SidebarLink({
  children,
  to,
}: {
  children: ReactNode;
  to: string;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex py-1 px-2 w-48 gap-2 hover:bg-accent-foreground/5 rounded items-center",
          {
            "bg-accent-foreground/10": isActive,
          }
        )
      }
    >
      {children}
    </NavLink>
  );
}
