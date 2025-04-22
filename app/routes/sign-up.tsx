import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Icon } from "~/components/ui/icon";
import { href, Link, redirect, useNavigation } from "react-router";
import type { Route } from ".react-router/types/app/routes/+types/sign-up";
import { Input } from "~/components/ui/textfield";
import { Label } from "~/components/ui/field";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { adapterContext } from "~/utils/adapterContext";
import { getSession } from "~/utils/sessionMiddleware";
import { signUpSchema } from "~/utils/schemas";
import { getTimingCollector } from "remix-utils/middleware/server-timing";
import { Form } from "~/components/ui/form";

export async function action({ context, request }: Route.ActionArgs) {
  const env = context.get(adapterContext);
  const collector = getTimingCollector(context);

  try {
    await collector.measure("sign up", async () => {
      const result = await env.auth.authenticate("form-signup", request);
      const session = getSession(context, "user");
      session.set("user", result);
      throw redirect("/");
    });
  } catch (error) {
    return error;
  }
}

export default function SignUp({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const loading = navigation.state !== "idle";

  const [form, fields] = useForm({
    // Sync the result of last submission
    lastResult: navigation.state === "idle" ? actionData : null,

    // Configure when each field should be validated
    shouldValidate: "onSubmit",
    shouldRevalidate: "onInput",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: signUpSchema });
    },
  });

  return (
    <Card className="z-50 rounded-md rounded-t-none max-w-full w-md self-center mt-16 lg:mt-24">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Sign Up</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          context={form.context}
          method="POST"
          encType="multipart/form-data"
          className="grid gap-4"
          {...getFormProps(form)}
        >
          <div className="grid gap-2">
            <Label htmlFor={fields.email.id}>Email</Label>
            <Input
              placeholder="me@example.com"
              required
              {...getInputProps(fields.email, { type: "email" })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={fields.password.id}>Password</Label>
            <Input
              {...getInputProps(fields.password, { type: "password" })}
              autoComplete="new-password"
              placeholder="Password"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={fields.passwordConfirmation.id}>
              Confirm Password
            </Label>
            <Input
              {...getInputProps(fields.passwordConfirmation, {
                type: "password",
              })}
              autoComplete="new-password"
              placeholder="Confirm Password"
            />
          </div>
          <Button type="submit" className="w-full" isDisabled={loading}>
            {loading ? (
              <Icon name="LoaderCircle" className="size-4 animate-spin" />
            ) : (
              "Create an account"
            )}
          </Button>
        </Form>
        <p className="text-sm mt-4">
          Already have an account?{" "}
          <Link
            className="text-purple-400 hover:text-purple-500 hover:underline"
            to={href("/sign-in")}
          >
            Sign In
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
