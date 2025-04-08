import { parseWithZod } from "@conform-to/zod";
import { Authenticator } from "remix-auth";
import { WebAuthnStrategy } from "remix-auth-webauthn/server";
import { FormStrategy } from "remix-auth-form";
import { z } from "zod";
import { getDb } from "~/utils/db";
import { signinSchema, signUpSchema } from "~/utils/schemas";
import uniqid from "~/utils/uniqid";
import type { SessionStorage } from "react-router";
import type { Kysely } from "kysely";
import type { DB } from "kysely-codegen";
export interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}

export function getAuth(
  env: Env,
  db: Kysely<DB>,
  sessionStorage: SessionStorage<{ challenge: string }>
) {
  const auth = new Authenticator<User>();

  async function createUser(email: string) {
    const user = {
      id: uniqid("usr-"),
      email,
      emailVerified: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.insertInto("freestyle_user").values(user).executeTakeFirst();

    return user;
  }
  auth.use(
    new FormStrategy(async ({ form }) => {
      const submission = parseWithZod(form, { schema: signinSchema });

      if (submission.status === "success") {
        const { email, password } = submission.value;
        // Check for the user
        const user = await db
          .selectFrom("freestyle_user")
          .leftJoin(
            "freestyle_account",
            "freestyle_user.id",
            "freestyle_account.userId"
          )
          .select([
            "freestyle_account.password",
            "freestyle_user.email",
            "freestyle_user.image",
            "freestyle_user.name",
            "freestyle_user.id",
          ])
          .where("freestyle_user.email", "=", email)
          .executeTakeFirst();

        if (!user?.password)
          throw submission.reply({ formErrors: ["Invalid email or password"] });

        if (!(await verifyPassword(user.password, password)))
          throw submission.reply({ formErrors: ["Invalid email or password"] });
        const { password: _, ...userData } = user;
        return userData;
      }
      throw submission.reply();
    }),
    "form-signin"
  );
  auth.use(
    new FormStrategy(async ({ form }) => {
      const submission = parseWithZod(form, { schema: signUpSchema });
      if (submission.status === "success") {
        // Check for the user
        const existingUser = await db
          .selectFrom("freestyle_user")
          .leftJoin(
            "freestyle_account",
            "freestyle_user.id",
            "freestyle_account.userId"
          )
          .select(["freestyle_account.password"])
          .where("freestyle_user.email", "=", submission.value.email)
          .executeTakeFirst();
        if (existingUser) {
          throw submission.reply({
            fieldErrors: { email: ["User already exists."] },
          });
        }
        const hashedPassword = await hashPassword(submission.value.password);

        const user = await createUser(submission.value.email);

        await db
          .insertInto("freestyle_account")
          .values({
            accountId: user.id,
            userId: user.id,
            id: uniqid("act-"),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            providerId: "credential",
            password: hashedPassword,
          })
          .executeTakeFirst();

        return user;
      }
      throw submission.reply();
    }),
    "form-signup"
  );

  async function getAuthenticatorById(id: string) {
    const authenticator = await db
      .selectFrom("freestyle_passkey")
      .selectAll()
      .where("freestyle_passkey.credentialID", "==", id)
      .executeTakeFirst();
    if (!authenticator) return null;
    return {
      id: authenticator.credentialID,
      userId: authenticator.userId,
      publicKey: authenticator.publicKey,
      counter: authenticator.counter,
      credentialDeviceType: authenticator.deviceType,
      credentialBackedUp: authenticator.backedUp === 1,
      transports: authenticator.transports || "",
      aaguid: authenticator.aaguid || "",
    };
  }

  async function getUserByUsername(username: string) {
    return db
      .selectFrom("freestyle_user")
      .select(["id", "name", "email", "image"])
      .where("email", "==", username)
      .executeTakeFirstOrThrow();
  }

  auth.use(
    new WebAuthnStrategy<User>(
      {
        sessionStorage,
        rpName: "Freestyle",
        rpID: (request) => new URL(request.url).hostname,
        origin: (request) => new URL(request.url).origin,
        getUserAuthenticators: async (user) => {
          if (!user) return [];
          const authenticators = await db
            .selectFrom("freestyle_passkey")
            .select([
              "freestyle_passkey.credentialID",
              "freestyle_passkey.transports",
              "freestyle_passkey.aaguid",
              "freestyle_passkey.createdAt",
            ])
            .where("freestyle_passkey.userId", "==", user?.id)
            .execute();
          return authenticators.map((a) => ({
            id: a.credentialID,
            aaguid: a.aaguid,
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            createdAt: new Date(a.createdAt!),
            transports: a.transports?.split(",") || [],
          }));
        },
        // Transform the user object into the shape expected by the strategy.
        // You can use a regular username, the users email address, or something else.
        getUserDetails: async (user) =>
          user ? { id: user.id, username: user.email } : null,
        // Find a user in the database with their username/email.
        getUserByUsername,
        getAuthenticatorById,
      },
      async function verify({ authenticator, type, username }) {
        let user: User | null = null;
        const savedAuthenticator = await getAuthenticatorById(authenticator.id);
        if (type === "registration") {
          // Check if the authenticator exists in the database
          if (savedAuthenticator) {
            throw new Error("Authenticator has already been registered.");
          }
          // Username is null for authentication verification,
          // but required for registration verification.
          // It is unlikely this error will ever be thrown,
          // but it helps with the TypeScript checking
          if (!username) throw new Error("Username is required.");
          user = await getUserByUsername(username);

          // Don't allow someone to register a passkey for
          // someone elses account.
          if (!user) {
            // Create a new user and authenticator
            user = await createUser(username);
          }
          await db
            .insertInto("freestyle_passkey")
            .values({
              userId: user.id,
              id: uniqid("psk-"),
              backedUp: authenticator.credentialBackedUp ? 1 : 0,
              counter: authenticator.counter,
              credentialID: authenticator.id,
              aaguid: authenticator.aaguid,
              deviceType: authenticator.credentialDeviceType,
              publicKey: authenticator.publicKey,
              createdAt: new Date().toISOString(),
              transports: authenticator.transports,
            })
            .execute();
        } else if (type === "authentication") {
          if (!savedAuthenticator) throw new Error("Authenticator not found");
          user = await db
            .selectFrom("freestyle_user")
            .select(["id", "name", "email", "image"])
            .where("id", "==", savedAuthenticator.userId)
            .executeTakeFirstOrThrow();
        }

        if (!user) throw new Error("User not found");
        return user;
      }
    ),
    "passkey"
  );

  return auth;
}
export async function hashPassword(
  password: string,
  providedSalt?: Uint8Array
): Promise<string> {
  const encoder = new TextEncoder();
  // Use provided salt if available, otherwise generate a new one
  const salt = providedSalt || crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  const exportedKey = (await crypto.subtle.exportKey(
    "raw",
    key
  )) as ArrayBuffer;
  const hashBuffer = new Uint8Array(exportedKey);
  const hashArray = Array.from(hashBuffer);
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const saltHex = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${saltHex}:${hashHex}`;
}

export async function verifyPassword(
  storedHash: string,
  passwordAttempt: string
): Promise<boolean> {
  const [saltHex, originalHash] = storedHash.split(":");
  const matchResult = saltHex.match(/.{1,2}/g);
  if (!matchResult) {
    throw new Error("Invalid salt format");
  }
  const salt = new Uint8Array(
    matchResult.map((byte) => Number.parseInt(byte, 16))
  );
  const attemptHashWithSalt = await hashPassword(passwordAttempt, salt);
  const [, attemptHash] = attemptHashWithSalt.split(":");
  return attemptHash === originalHash;
}
