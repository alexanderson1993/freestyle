import type { DB } from "kysely-codegen";
import { z } from "zod";

const password = z.string().min(8);
const email = z
  .string()
  .email()
  .transform((email) => email.toLowerCase());
export const signUpSchema = z
  .object({
    email: z
      .string()
      .email()
      .transform((email) => email.toLowerCase()),
    password,
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords don't match",
    path: ["passwordConfirmation"],
  });
export const signinSchema = z.object({
  email,
  password: z.string(),
});
export const profileUpdateSchema = z
  .object({
    name: z.string().optional(),
    email: email.optional(),
    password: password.optional(),
    passwordConfirmation: z.string().optional(),
  })
  .refine(
    (data) => !data.password || data.password === data.passwordConfirmation,
    {
      message: "Passwords don't match",
      path: ["passwordConfirmation"],
    }
  );

type Field = Pick<
  DB["freestyle_field"],
  "field" | "interface" | "name" | "note" | "required"
> & { options: Record<string, unknown> };

export function fieldsToZod(fields: Field[]) {
  return z.object({
    ...Object.fromEntries(
      fields.map(({ field, name, options, required }) => {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        let type: any = z.any();
        switch (field) {
          case "string": {
            type = z.string();
            if (options.minLength) {
              type = type.minLength(Number(options.minLength));
            }
            if (options.maxLength) {
              type = type.maxLength(Number(options.maxLength));
            }
            if (
              options.validationPattern &&
              typeof options.validationPattern === "string"
            ) {
              type = type.regex(new RegExp(options.validationPattern));
            }
            if (!required) type = type.optional();
            break;
          }
          case "richText": {
            type = z.string();

            if (!required) type = type.optional();
            break;
          }
          case "number": {
            type = z.number();
            if (options.min) {
              type.min(Number(options.min));
            }
            if (options.max) {
              type.max(Number(options.max));
            }
            if (options.integer) {
              type.int();
            }
            if (!required) type = type.optional();

            break;
          }
          case "boolean": {
            type = z.coerce.boolean();
            break;
          }
          case "datetime": {
            type = z.coerce.date();
            if (options.min) {
              type.min(Number(options.min));
            }
            if (!required) type = type.optional();
            break;
          }
          // TODO
          case "select":
          case "file":
          case "relation":
          case "json":
        }
        return [name, type];
      })
    ),
  });
}
