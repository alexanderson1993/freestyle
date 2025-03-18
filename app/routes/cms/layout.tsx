import { NavLink, Outlet } from "react-router";
import { Button, buttonVariants } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import { cn } from "~/utils/cn";

export default function Layout() {
  return (
    <div className="flex items-stretch min-h-screen">
      <div className="flex flex-col p-2 bg-muted text-muted-foreground gap-4">
        <NavLink
          to="collections"
          className={({ isActive }) =>
            cn(
              buttonVariants({
                className: "p-2",
                variant: isActive ? "outline" : "ghost",
                size: "icon",
              })
            )
          }
        >
          <Icon name="Database" aria-label="Collections" />
        </NavLink>
        <NavLink
          to="settings"
          className={({ isActive }) =>
            cn(
              buttonVariants({
                className: "p-2",
                variant: isActive ? "outline" : "ghost",
                size: "icon",
              })
            )
          }
        >
          <Icon name="Settings" aria-label="Settings" />
        </NavLink>
      </div>
      <Outlet />
    </div>
  );
}
