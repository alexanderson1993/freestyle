import { betterAuth } from "better-auth";
import { getDb } from "./db";
import { passkey } from "better-auth/plugins/passkey";

export function getAuth(env: Env, db = getDb(env.DB)) {
  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    database: {
      db,
      type: "sqlite",
    },
    emailAndPassword: {
      enabled: true,
      async sendResetPassword(data, request) {
        // Send an email to the user with a link to reset their password
      },
    },
    socialProviders: {},
    plugins: [
      passkey({
        schema: {
          passkey: { modelName: "freestyle_passkey", fields: {} },
        },
      }),
    ],
    // Overwrite the table names so we don't have potential collisions
    // with collection names
    user: {
      modelName: "freestyle_user",
    },
    session: {
      modelName: "freestyle_session",
    },
    account: {
      modelName: "freestyle_account",
    },
    verification: {
      modelName: "freestyle_verification",
    },
  });
}
