import { getMigrations } from "better-auth/db";
import type { BetterAuthOptions } from "better-auth";
import { getAuth } from "~/utils/auth.server";
import { stubDb } from "./stubDb";

export type SchemaGenerator = (opts: {
  file?: string;
  options: BetterAuthOptions;
}) => Promise<{
  code?: string;
  fileName: string;
  overwrite?: boolean;
  append?: boolean;
}>;

const generateMigrations: SchemaGenerator = async ({ options, file }) => {
  const migrationNum =
    Array.from(new Bun.Glob("*.sql").scanSync("./migrations")).length + 1;

  const { compileMigrations } = await getMigrations(options);
  const migrations = await compileMigrations();
  return {
    code: migrations,
    fileName:
      file ||
      `./migrations/${migrationNum
        .toString()
        .padStart(4, "0")}_better-auth.sql`,
  };
};

const { code, fileName } = await generateMigrations({
  options: getAuth({} as any, stubDb).options,
});
if (!code) {
  console.info("No migrations to apply");
} else {
  Bun.file(fileName).write(code);
  console.info(`Migration written to ${fileName}`);
}
