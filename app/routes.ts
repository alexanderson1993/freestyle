import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  layout("routes/cms/layout.tsx", [
    route("settings", "routes/cms/settingsSidebar.tsx", [
      route("collections", "routes/cms/settings.tsx"),
    ]),
    route("collections", "routes/cms/collectionsSidebar.tsx", [
      route(":collection", "routes/cms/collections.tsx"),
    ]),
  ]),
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
