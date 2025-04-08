import { createCookieSessionStorage, createRequestHandler } from "react-router";

// @ts-ignore - no types
import * as build from "virtual:react-router/server-build";

import { adapterContext } from "./utils/adapterContext";
import { getDb } from "~/utils/db";
import { getAuth, type User } from "~/utils/auth.server";
import { R2FileStorage } from "@edgefirst-dev/r2-file-storage";
import { DurableObject } from "cloudflare:workers";

const handler = createRequestHandler(build);

export class Server extends DurableObject<Env> {
  fetch(request: Request): Response | Promise<Response> {
    const websocketPair = new WebSocketPair();
    const client = websocketPair[0];
    const server = websocketPair[1];

    this.ctx.acceptWebSocket(server);

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }
  webSocketMessage(
    ws: WebSocket,
    message: string | ArrayBuffer
  ): void | Promise<void> {
    ws.send(
      `[Durable Object] message: ${message}, connections: ${
        this.ctx.getWebSockets().length
      }`
    );
  }
  webSocketClose(
    ws: WebSocket,
    code: number,
    reason: string,
    wasClean: boolean
  ): void | Promise<void> {
    ws.close(code, "Durable Object is closing WebSocket");
  }
}

export default {
  async fetch(request: Request, env: Env) {
    try {
      if (request.headers.get("upgrade") === "websocket") {
        const id = env.Server.idFromName("server");
        const stub = env.Server.get(id) as DurableObjectStub<Server>;

        return stub.fetch(request);
      }

      const challengeSessionStorage = createCookieSessionStorage<{
        challenge: string;
      }>({
        cookie: {
          name: "webauthn_challenge",
          maxAge: 60 * 5, // Reset after 5 minutes
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          secure: env.ENV === "production",
          secrets: env.COOKIE_SECRET.split(","),
        },
      });
      const db = getDb(env.DB);

      const contextValue = {
        ...env,
        db,
        auth: getAuth(env, db, challengeSessionStorage),
        // @ts-expect-error types aren't up to date with Wrangler
        r2: new R2FileStorage(env.R2),
      };

      const context = new Map([[adapterContext, contextValue]]);
      return handler(request, context);
    } catch (error) {
      console.error(error);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
