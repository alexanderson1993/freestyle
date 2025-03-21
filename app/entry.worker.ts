import { createCookieSessionStorage, createRequestHandler } from "react-router";

// @ts-expect-error - no types
import * as build from "virtual:react-router/server-build";

import { adapterContext } from "./utils/adapterContext";
import { getDb } from "~/utils/db";
import { getAuth } from "~/utils/auth.server";
import type { User } from "~/utils/sessionMiddleware";
import { R2FileStorage } from "@edgefirst-dev/r2-file-storage";

const handler = createRequestHandler(build);

export default {
  fetch(request: Request, env: Env) {
    const cookieConfig = {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: env.ENV === "production",
      secrets: env.COOKIE_SECRET.split(","),
    } as const;
    const sessions = {
      user: createCookieSessionStorage<{ user: User }>({
        cookie: {
          name: "user.session",
          maxAge: 60 * 60 * 24 * 30, // Reset after a month
          ...cookieConfig,
        },
      }),
    };
    try {
      const contextValue = {
        ...env,
        db: getDb(env.DB),
        auth: getAuth(env),
        // @ts-expect-error types aren't up to date with Wrangler
        r2: new R2FileStorage(env.R2),
        sessions,
      };

      const context = new Map([[adapterContext, contextValue]]);
      // @ts-expect-error incorrect types during unstable period
      return handler(request, context);
    } catch (error) {
      console.error(error);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
