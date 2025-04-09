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
import {
  data,
  Form as RRForm,
  href,
  Link,
  redirect,
  useNavigation,
} from "react-router";
import { Icon } from "~/components/ui/icon";
import type { Route } from ".react-router/types/app/routes/+types/sign-in";
import { adapterContext } from "~/utils/adapterContext";
import { parseWithZod } from "@conform-to/zod";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getSession } from "~/utils/sessionMiddleware";
import { signinSchema } from "~/utils/schemas";
import { handleFormSubmit } from "remix-auth-webauthn/browser";
import type { WebAuthnStrategy } from "remix-auth-webauthn";
import type { User } from "~/utils/auth.server";
import { Form } from "~/components/ui/form";

export async function loader({ context, request, params }: Route.LoaderArgs) {
  const env = context.get(adapterContext);

  const strategy = env.auth.get("passkey") as WebAuthnStrategy<User>;
  const challengeSession = await strategy.sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  const options = await strategy.generateOptions(request, null);
  challengeSession.set("challenge", options.challenge);

  return data(
    { options },
    {
      headers: {
        "Set-Cookie": await strategy.sessionStorage.commitSession(
          challengeSession
        ),
      },
    }
  );
}

export async function action({ context, request }: Route.ActionArgs) {
  const env = context.get(adapterContext);

  try {
    const session = getSession(context, "user");
    const formData = await request.clone().formData();
    const type = formData.get("type");
    if (type === "authentication") {
      const result = await env.auth.authenticate("passkey", request);
      session.set("user", result);
      throw redirect("/");
    }
    const result = await env.auth.authenticate("form-signin", request);
    session.set("user", result);
    throw redirect("/");
  } catch (error) {
    if (error instanceof Error) {
      return {
        status: "error",
        intent: undefined,
        initialValue: {},
        error: { "": [error.message] },
        state: undefined,
        fields: ["type", "response"],
      };
    }
    return error;
  }
}

export default function SignIn({
  actionData,
  loaderData: { options },
}: Route.ComponentProps) {
  const navigation = useNavigation();
  const [form, fields] = useForm({
    // Sync the result of last submission
    lastResult: navigation.state === "idle" ? actionData : null,

    // Configure when each field should be validated
    shouldValidate: "onSubmit",
    shouldRevalidate: "onInput",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: signinSchema });
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
        </Form>
        <RRForm
          method="POST"
          className="mt-2"
          onSubmit={handleFormSubmit(options)}
        >
          <Button
            variant="secondary"
            className="gap-2 w-full"
            type="submit"
            name="intent"
            value="authentication"
          >
            <Icon name="Key" className="size-4" />
            Sign-in with Passkey
          </Button>
        </RRForm>
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
