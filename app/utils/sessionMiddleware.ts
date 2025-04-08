import {
  createCookieSessionStorage,
  unstable_createContext,
  type unstable_RouterContextProvider,
  type Session,
  type unstable_MiddlewareFunction,
} from "react-router";
import { adapterContext } from "~/utils/adapterContext";
import type { User } from "~/utils/auth.server";

interface SessionData {
  user: { user: User };
}

const sessionContext = unstable_createContext<{
  [K in keyof SessionData]: Session<SessionData[K]>;
}>();

export const sessionMiddleware: unstable_MiddlewareFunction<Response> = async (
  { request, context },
  next
) => {
  if (new URL(request.url).pathname === "/ws") return next();

  const env = context.get(adapterContext);
  const cookieConfig = {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: env.ENV === "production",
    secrets: env.COOKIE_SECRET.split(","),
  } as const;

  const sessionStorages = {
    user: createCookieSessionStorage<{ user: User }>({
      cookie: {
        name: "user.session",
        maxAge: 60 * 60 * 24 * 30, // Reset after a month
        ...cookieConfig,
      },
    }),
  };
  const sessions = Object.fromEntries(
    await Promise.all(
      Object.entries(sessionStorages).map(async ([key, storage]) => [
        key,
        await storage.getSession(request.headers.get("Cookie")),
      ])
    )
  );
  context.set(sessionContext, sessions);

  const response = await next();

  for (const key in sessionStorages) {
    response.headers.append(
      "Set-Cookie",
      await sessionStorages[key as keyof typeof sessionStorages].commitSession(
        sessions[key as keyof typeof sessions]
      )
    );
  }

  return response;
};

export function getSession(
  context: unstable_RouterContextProvider,
  key: keyof SessionData
) {
  return context.get(sessionContext)[key];
}
