import type { Route } from ".react-router/types/app/routes/cms/+types/collections";
import {
  href,
  Link,
  Outlet,
  useLocation,
  useMatches,
  useNavigation,
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

export default function Collections({
  params: { collection },
}: Route.ComponentProps) {
  const pathname = useLocation().pathname;
  const navigation = useNavigation();
  const { revalidate } = useRevalidator();
  const matches = useMatches();
  return (
    <div className="flex-auto flex flex-col">
      <div className="pt-4 px-6 flex w-full gap-4 items-center mb-4">
        <Breadcrumbs>
          <BreadcrumbItem>
            <BreadcrumbPage>Collections</BreadcrumbPage>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink
              to={href("/collections/:collection", { collection })}
            >
              {collection}
            </BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
          {matches.map((match) => {
            if (
              match.handle &&
              typeof match.handle === "object" &&
              "breadcrumb" in match.handle &&
              typeof match.handle.breadcrumb === "function"
            ) {
              const { label, path } = match.handle.breadcrumb(collection);
              if (!label) return null;
              return (
                <BreadcrumbItem>
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
            to={href("/collections/:collection/settings", { collection })}
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
            New Record
          </Link>
        )}
      </div>
      <Outlet />
    </div>
  );
}
