import type { Route } from ".react-router/types/app/routes/api/+types/images";
import { adapterContext } from "~/utils/adapterContext";
export async function loader({
  request,
  params: { "*": path },
  context,
}: Route.LoaderArgs) {
  const env = context.get(adapterContext);
  const file = await env.r2.get(path);
  if (!file) throw new Response("Not found", { status: 404 });
  return new Response(file?.stream(), {
    headers: {
      contentType: file.type,
      contentLength: file.size.toString(),
    },
  });
}
