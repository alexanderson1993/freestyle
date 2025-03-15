import { createRequestHandler } from "react-router";

// @ts-expect-error - no types
import * as build from "virtual:react-router/server-build";

import { adapterContext } from "./utils/adapterContext";
import { Server, type Connection } from "partyserver";

const handler = createRequestHandler(build);

export class MyServer extends Server<Env> {
  onRequest(request: Request): Response | Promise<Response> {
    return new Response("Hello from Durable Object!");
  }
  onMessage(connection: Connection<unknown>, message: string) {
    console.log("message from client:", message);

    connection.send("WS Message from Durable Object!");
  }
}

export default {
  fetch(request: Request, env: Env) {
    try {
      const context = new Map([[adapterContext, env]]);
      // @ts-expect-error incorrect types during unstable period
      return handler(request, context);
    } catch (error) {
      console.error(error);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
