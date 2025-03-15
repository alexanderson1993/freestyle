import { Database } from "bun:sqlite";
import { Kysely } from "kysely";
import { BunSqliteDialect } from "kysely-bun-sqlite";
import type { DB } from "kysely-codegen";
import path from "node:path";

const d1Path = "./.wrangler/state/v3/d1";

export const databasePath = path.join(
  d1Path,
  new Bun.Glob("**/*.sqlite").scanSync(d1Path).next().value
);

export const stubDb = new Kysely<DB>({
  dialect: new BunSqliteDialect({
    database: new Database(databasePath),
  }),
});
