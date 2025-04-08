import type { R2FileStorage } from "@edgefirst-dev/r2-file-storage";
import { unstable_createContext, type SessionStorage } from "react-router";
import type { getAuth, User } from "~/utils/auth.server";
import type { getDb } from "~/utils/db";

export const adapterContext = unstable_createContext<
  Env & {
    db: ReturnType<typeof getDb>;
    auth: ReturnType<typeof getAuth>;
    r2: R2FileStorage;
  }
>();
