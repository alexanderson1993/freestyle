import { unstable_createServerTimingMiddleware } from "remix-utils/middleware/server-timing";

export const [serverTimingMiddleware, getTimingCollector] =
  unstable_createServerTimingMiddleware();
