import {
  type RouteConfig,
  index,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  ...prefix("/api", [
    route("/auth/*", "routes/api/auth.ts"),
    route("/theme-switch", "routes/api/themeSwitcher.tsx"),
    route("/logout", "routes/api/logout.ts"),
  ]),
  route("/sign-in", "routes/sign-in.tsx"),
  route("/sign-up", "routes/sign-up.tsx"),
  route("/images/*", "routes/api/images.ts"),
  route("/ws", "routes/ws.ts"),
] satisfies RouteConfig;
