import { Outlet } from "react-router";
import { Icon } from "~/components/ui/icon";
import { SidebarLink } from "~/components/ui/sidebarLink";

export default function Settings() {
  return (
    <>
      <div className="py-4 px-4 bg-accent">
        <SidebarLink to="collections">
          <Icon name="Zap" className="size-5" /> Flows
        </SidebarLink>
        <SidebarLink to="collections">
          <Icon name="Users" className="size-5" /> Roles
        </SidebarLink>
        <SidebarLink to="collections">
          <Icon name="ShieldAlert" className="size-5" /> Access Policies
        </SidebarLink>
        <SidebarLink to="collections">
          <Icon name="Settings2" className="size-5" /> Settings
        </SidebarLink>
        <SidebarLink to="collections">
          <Icon name="Palette" className="size-5" /> Appearance
        </SidebarLink>
        <SidebarLink to="collections">
          <Icon name="Bookmark" className="size-5" /> Bookmarks
        </SidebarLink>
      </div>
      <Outlet />
    </>
  );
}
