import { adapterContext } from "~/utils/adapterContext";
import type { Route } from "./+types/profile-redirect";
import { getSession, sessionMiddleware } from "~/utils/sessionMiddleware";
import { redirect } from "react-router";
export async function loader({ context }: Route.LoaderArgs) {
  const userSession = getSession(context, "user");

  const user = userSession.get("user");
  if (!user) throw redirect("/");

  throw redirect(`/users/${user.id}`);
}
