import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { Input } from "~/components/ui/textfield";
import { Label } from "~/components/ui/field";
import { Checkbox } from "~/components/ui/checkbox";
import { authClient } from "~/utils/auth.client";
import { Form, href, Link, redirect, useNavigation } from "react-router";
import { Icon } from "~/components/ui/icon";
import type { Route } from ".react-router/types/app/routes/+types/sign-in";
import { adapterContext } from "~/utils/adapterContext";
import z from "zod";
import { parseWithZod } from "@conform-to/zod";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getSession } from "~/utils/sessionMiddleware";

const schema = z.object({
  email: z.string().email({ message: "Please use a valid email address." }),
  password: z.string(),
  remember: z.boolean().optional(),
});

export async function action({ context, request }: Route.ActionArgs) {
  const env = context.get(adapterContext);
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status === "success") {
    try {
      const result = await env.auth.api.signInEmail({
        body: submission.value,
        asResponse: false,
      });
      const session = getSession(context, "user");
      session.set("user", result.user);
    } catch (error) {
      if (error instanceof Error) {
        return submission.reply({ formErrors: [error.message] });
      }
      return submission.reply({ formErrors: ["Error signing in."] });
    }
    throw redirect("/");
  }

  return submission.reply();
}

export default function SignIn({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const [form, fields] = useForm({
    // Sync the result of last submission
    lastResult: navigation.state === "idle" ? actionData : null,

    // Configure when each field should be validated
    shouldValidate: "onSubmit",
    shouldRevalidate: "onInput",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });

  const loading = navigation.state !== "idle";
  return (
    <Card className="max-w-full w-md self-center mt-24 lg:mt-48">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Sign In</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form
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
            <p className="text-red-500">{fields.email.errors}</p>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor={fields.password.id}>Password</Label>
            </div>

            <Input
              placeholder="password"
              autoComplete="password"
              {...getInputProps(fields.password, { type: "password" })}
            />
            <p className="text-red-500">{fields.password.errors}</p>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              {...getInputProps(fields.remember, { type: "checkbox" })}
            />
            <Label htmlFor={fields.remember.id}>Remember me</Label>
            <Link href="#" className="ml-auto inline-block text-sm underline">
              Forgot your password?
            </Link>
          </div>
          <p className="text-red-500">{fields.remember.errors}</p>

          <div>
            <p className="text-red-500">{form.errors}</p>
          </div>

          <Button type="submit" className="w-full" isDisabled={loading}>
            {loading ? (
              <Icon name="LoaderCircle" className="size-4 animate-spin" />
            ) : (
              "Login"
            )}
          </Button>

          {/* <Button
            variant="secondary"
            className="gap-2"
            onPress={async () => {
              await authClient.signIn.passkey();
            }}
          >
            <Icon name="Key" className="size-4" />
            Sign-in with Passkey
          </Button> */}
        </Form>
        <p className="text-sm mt-4">
          New here?{" "}
          <Link
            className="text-purple-400 hover:text-purple-500 hover:underline"
            to={href("/sign-up")}
          >
            Sign Up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
