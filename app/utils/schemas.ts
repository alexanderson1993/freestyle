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
