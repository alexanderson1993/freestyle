import { Dialog, DialogTrigger, Modal } from "react-aria-components";
import { Outlet } from "react-router";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import { SidebarLink } from "~/components/ui/sidebarLink";

export default function Collections() {
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
        <div className="border border-white/10 w-full my-4" />
        <DialogTrigger>
          <Button className="w-full">
            <Icon name="Plus" className="size-5 mr-2" /> New Collection
          </Button>
          <Modal className="fixed inset-0 bg-black/50 backdrop-blur-lg transition-all flex items-center justify-center">
            <Dialog className="outline-none p-8 max-h-[inherit] box-border overflow-auto bg-gray-900 rounded-lg w-max">
              <div> Hello!</div>
              <Button slot="close">Done</Button>
            </Dialog>
          </Modal>
        </DialogTrigger>
      </div>
      <Outlet />
    </>
  );
}
