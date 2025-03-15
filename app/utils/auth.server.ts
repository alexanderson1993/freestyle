import { betterAuth } from "better-auth";
import { getDb } from "./db";
import { passkey } from "better-auth/plugins/passkey";

export function getAuth(env: Env, db = getDb(env.DB)) {
  return betterAuth({
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
    plugins: [passkey()],
  });
}
