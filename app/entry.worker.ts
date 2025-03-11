import { createRequestHandler, unstable_createContext, unstable_RouterContextProvider } from "react-router";

// @ts-expect-error - no types
import * as build from "virtual:react-router/server-build";

import { adapterContext } from "./adapterContext";

const handler = createRequestHandler(build);

export default {
  fetch(request: Request, env: Env) {
    try {
      const context = new Map([[adapterContext, env]]);
      return handler(request, context);
    } catch (error) {
      console.error(error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }
}
