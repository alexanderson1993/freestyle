import { D1Dialect } from "kysely-d1";
import { Kysely } from "kysely";
import type { DB } from "kysely-codegen";

export function getDb(database: D1Database) {
  return new Kysely<DB>({
    dialect: new D1Dialect({
      database,
    }),
  });
}
