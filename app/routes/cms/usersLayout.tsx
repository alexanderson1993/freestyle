import {
  href,
  Link,
  Outlet,
  useLocation,
  useMatches,
  useNavigation,
  useParams,
  useRevalidator,
} from "react-router";
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  Breadcrumbs,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumbs";
import { Button, buttonVariants } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import { SidebarLink } from "~/components/ui/sidebarLink";

export default function Users() {
  const pathname = useLocation().pathname;
  const navigation = useNavigation();
  const { revalidate } = useRevalidator();
  const matches = useMatches();
  const params = useParams();

  return (
    <>
      <div className="py-4 px-4 bg-accent">
        <SidebarLink to="">
          <Icon name="Users" className="size-5" /> All Users
        </SidebarLink>
        {/* TODO: Put individual roles here */}
      </div>
      <div className="flex-auto flex flex-col">
        <div className="pt-4 px-6 flex w-full gap-4 items-center mb-4">
          <Breadcrumbs>
            <BreadcrumbItem>
              <BreadcrumbLink to={href("/users")}>Users</BreadcrumbLink>
              <BreadcrumbSeparator />
            </BreadcrumbItem>
            {matches.map((match) => {
              if (
                match.handle &&
                typeof match.handle === "object" &&
                "breadcrumb" in match.handle &&
                typeof match.handle.breadcrumb === "function"
              ) {
                const { label, path } = match.handle.breadcrumb(match);
                if (!label) return null;
                return (
                  <BreadcrumbItem key={label}>
                    {path ? (
                      <BreadcrumbLink to={path}>{label}</BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{label}</BreadcrumbPage>
                    )}
                    <BreadcrumbSeparator />
                  </BreadcrumbItem>
                );
              }
              return null;
            })}
          </Breadcrumbs>
          {pathname.includes("settings") ? null : (
            <Link
              to={href("/users/settings")}
              className={buttonVariants({ variant: "ghost", size: "icon" })}
            >
              <Icon name="Settings" />
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Refresh"
            onPress={() => revalidate()}
          >
            <Icon
              name="RefreshCw"
              className={navigation.state === "loading" ? "animate-spin" : ""}
            />
          </Button>
          <div className="flex-auto" />
          {pathname.endsWith("/new") ? null : (
            <Link className={buttonVariants({})} to="new">
              <Icon name="Plus" className="size-4 mr-2" />
              New User
            </Link>
          )}
        </div>
        <Outlet />
      </div>
    </>
  );
}
