import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { getSession, sessionMiddleware } from "~/utils/sessionMiddleware";

export const unstable_middleware = [sessionMiddleware];

export function meta() {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  const user = getSession(context, "user").get("user");
  const message = "Hi there!";
  return { message, user };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <Welcome message={loaderData.message} user={loaderData.user} />;
}
