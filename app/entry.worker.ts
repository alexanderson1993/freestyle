import { createRequestHandler } from "react-router";

// @ts-expect-error - no types
import * as build from "virtual:react-router/server-build";

import { adapterContext } from "./adapterContext";
import { Server, type Connection } from "partyserver";

const handler = createRequestHandler(build);

export class MyServer extends Server<Env> {
  onRequest(request: Request): Response | Promise<Response> {
    return new Response("Hello there!");
  }
  onMessage(connection: Connection<unknown>, message: string) {
    console.log("message from client:", message);

    connection.send("Oh hello!");
  }
}

export default {
  fetch(request: Request, env: Env) {
    try {
      const context = new Map([[adapterContext, env]]);
      return handler(request, context);
    } catch (error) {
      console.error(error);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
