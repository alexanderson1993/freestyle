import type { Route } from ".react-router/types/app/routes/cms/+types/collectionsSidebar";
import { Link, Outlet } from "react-router";
import { buttonVariants } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import { SidebarLink } from "~/components/ui/sidebarLink";
import { adapterContext } from "~/utils/adapterContext";

export async function loader({ params, context }: Route.LoaderArgs) {
  const env = context.get(adapterContext);

  return env.db
    .selectFrom("freestyle_collection")
    .select(["name"])
    .where("hidden", "!=", 1)
    .execute();
}

export default function Collections({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <div className="py-4 px-4 bg-accent">
        {loaderData.map(({ name }) => (
          <SidebarLink to={name} key={name}>
            <Icon name="Database" className="size-5" /> {name}
          </SidebarLink>
        ))}
        <div className="border border-white/10 w-full my-4" />
        <Link to="new" className={buttonVariants({ className: "w-full" })}>
          <Icon name="Plus" className="size-5 mr-2" /> New Collection
        </Link>
      </div>
      <Outlet />
    </>
  );
}
