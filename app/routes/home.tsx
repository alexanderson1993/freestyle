import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { adapterContext } from "~/adapterContext";
import { getServerByName } from "partyserver";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  const DO = context.get(adapterContext).MyServer;
  const message = await (
    await (
      await getServerByName(DO, "test")
    ).fetch(new URL("/", "https://example.com"))
  ).text();
  return { message };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <Welcome message={loaderData.message} />;
}
