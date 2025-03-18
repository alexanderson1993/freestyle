import type { Route } from ".react-router/types/app/routes/api/+types/logout";
import { redirect } from "react-router";
import { adapterContext } from "~/utils/adapterContext";
import { getSession } from "~/utils/sessionMiddleware";

export async function action({ request, context }: Route.ActionArgs) {
  const session = getSession(context, "user");
  session.unset("user");
  throw redirect("/");
}
