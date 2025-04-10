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
    route("profile", "routes/cms/profile-redirect.tsx", {
      id: "profile-redirect",
    }),
    route("users", "routes/cms/usersLayout.tsx", [
      route("profile", "routes/cms/profile-redirect.tsx"),
      route(":userId", "routes/cms/user.tsx"),
    ]),
    route("collections", "routes/cms/collectionsSidebar.tsx", [
      route("new", "routes/cms/collectionNew.tsx"),
      route(":collection", "routes/cms/collections.tsx", [
        index("routes/cms/records.tsx"),
        route("settings", "routes/cms/collectionSettings.tsx"),
        route("new", "routes/cms/recordsNew.tsx"),
        route(":recordId", "routes/cms/recordDetails.tsx"),
      ]),
    ]),
  ]),
  ...prefix("/api", [
    route("/theme-switch", "routes/api/themeSwitcher.tsx"),
    route("/logout", "routes/api/logout.ts"),
  ]),
  route("/sign-in", "routes/sign-in.tsx"),
  route("/sign-up", "routes/sign-up.tsx"),
  route("/images/*", "routes/api/images.ts"),
] satisfies RouteConfig;
