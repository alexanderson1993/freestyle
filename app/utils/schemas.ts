import { z } from "zod";

export const signUpSchema = z
  .object({
    email: z
      .string()
      .email()
      .transform((email) => email.toLowerCase()),
    password: z.string(),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords don't match",
    path: ["passwordConfirmation"],
  });
export const signinSchema = z.object({
  email: z
    .string()
    .email()
    .transform((email) => email.toLowerCase()),
  password: z.string(),
});
