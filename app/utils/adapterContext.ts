import { unstable_createContext } from "react-router";
import type { getAuth } from "~/utils/auth.server";
import type { getDb } from "~/utils/db";

export const adapterContext = unstable_createContext<
  Env & {
    db: ReturnType<typeof getDb>;
    auth: ReturnType<typeof getAuth>;
  }
>();
