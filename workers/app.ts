import {
  createRequestHandler,
  unstable_RouterContextProvider,
} from "react-router";
import { adapterContext } from "~/adapterContext";

declare global {
  interface CloudflareEnvironment extends Env {}
}

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: CloudflareEnvironment;
      ctx: ExecutionContext;
    };
  }
}

const requestHandler = createRequestHandler(
  // @ts-expect-error - virtual module provided by React Router at build time
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export default {
  fetch(request, env, ctx) {
    const contextProvider = new unstable_RouterContextProvider(
      new Map([[adapterContext, env]])
    );
    return requestHandler(request, contextProvider);
  },
} satisfies ExportedHandler<CloudflareEnvironment>;
