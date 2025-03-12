import type { Route } from ".react-router/types/app/routes/+types/ws";
import { getServerByName } from "partyserver";
import { adapterContext } from "~/adapterContext";

export async function loader({ request, context }: Route.LoaderArgs) {
  const stub = await getServerByName(
    context.get(adapterContext).MyServer,
    "test"
  );
  return stub.fetch(request);
}
