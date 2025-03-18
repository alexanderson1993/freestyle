import type { Route } from ".react-router/types/app/routes/+types/ws";
import { getServerByName } from "partyserver";
import { adapterContext } from "~/utils/adapterContext";

export async function loader({ request, context }: Route.LoaderArgs) {
  const stub = await getServerByName(
    context.get(adapterContext).MyServer,
    "test"
  );
  const response = await stub.fetch(request);
  return new Response(response.body, response);
}
