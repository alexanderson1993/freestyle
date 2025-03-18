import type { Route } from ".react-router/types/app/routes/api/+types/auth";
import { adapterContext } from "~/utils/adapterContext";
import { getAuth } from "~/utils/auth.server";

export async function loader({ request, context }: Route.LoaderArgs) {
  const env = context.get(adapterContext);
  const auth = getAuth(env);
  return auth.handler(request);
}

export async function action({ request, context }: Route.ActionArgs) {
  const env = context.get(adapterContext);
  const auth = getAuth(env);
  return auth.handler(request);
}
