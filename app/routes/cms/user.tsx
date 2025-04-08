import { getSession } from "~/utils/sessionMiddleware";
import type { Route, Info } from "./+types/user";
import {
  data,
  Form,
  isRouteErrorResponse,
  type RouteMatch,
} from "react-router";
import type { User } from "~/utils/auth.server";
import { adapterContext } from "~/utils/adapterContext";
import { Input, TextField } from "~/components/ui/textfield";
import { FieldError, Label } from "~/components/ui/field";
import { Icon } from "~/components/ui/icon";
import type { WebAuthnStrategy } from "remix-auth-webauthn";
import { handleFormSubmit } from "remix-auth-webauthn/browser";
import { Button } from "~/components/ui/button";
import { aaguids } from "~/utils/aaguid.server";
import { useTheme } from "~/routes/api/themeSwitcher";

export const handle = {
  breadcrumb: (match: { data: User; params: Info["params"] }) => {
    if (!match.data) return { label: null };
    return { label: match.data.name || match.data.email };
  },
};

export async function loader({ context, request, params }: Route.LoaderArgs) {
  const env = context.get(adapterContext);
  const user = await env.db
    .selectFrom("freestyle_user")
    .select(["id", "email", "name", "image"])
    .where("id", "==", params.userId)
    .executeTakeFirst();
  if (!user) throw new Response("Not Found", { status: 404 });
  const strategy = env.auth.get("passkey") as WebAuthnStrategy<User>;
  const challengeSession = await strategy.sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  const options = await strategy.generateOptions(request, user);
  challengeSession.set("challenge", options.challenge);

  const authenticators = (await strategy.getUserAuthenticators(user)).map(
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    (a: any) =>
      ({
        id: a.id,
        aaguid: a.aaguid,
        provider: aaguids[a.aaguid],
        transports: a.transports,
        createdAt: a.createdAt,
      } as {
        id: string;
        aaguid: string;
        provider: { name: string; icon_dark: string; icon_light: string };
        transports: string[];
        createdAt: Date;
      })
  );

  return data(
    { user, options, authenticators },
    {
      headers: {
        "Set-Cookie": await strategy.sessionStorage.commitSession(
          challengeSession
        ),
      },
    }
  );
}

export async function action({ request, context }: Route.ActionArgs) {
  const env = context.get(adapterContext);
  const user = getSession(context, "user").get("user");
  const formData = await request.clone().formData();
  if (formData.get("type") === "registration") {
    try {
      if (formData.get("username") !== user?.email) {
        throw new Error(
          "Invalid username. You can only register passkeys for your own account."
        );
      }
      await env.auth.authenticate("passkey", request);
    } catch (error) {
      if (error instanceof Error) {
        return { error };
      }
      throw error;
    }
  }
}

export default function EditUser({
  params: { userId },
  loaderData: { user, options, authenticators },
  actionData,
}: Route.ComponentProps) {
  const theme = useTheme();
  return (
    <div className="px-6">
      <h1 className="text-4xl font-medium">Profile Settings</h1>
      <div className="my-8 size-32 rounded-full overflow-hidden bg-background border border-muted">
        {user.image ? (
          <img src={user.image} alt="User" className="size-full" />
        ) : (
          <Icon className="size-full" name="User" />
        )}
      </div>
      <Form method="POST" className="max-w-md space-y-4">
        <TextField name="name" defaultValue={user.name || ""}>
          <Label>Name</Label>
          <Input placeholder="Alex" />
          <FieldError />
        </TextField>
        <TextField name="email" defaultValue={user.email}>
          <Label>Email</Label>
          <Input placeholder="alex@freestylecms.com" />
          <FieldError />
        </TextField>
        <TextField name="password">
          <Label>Password</Label>
          <Input placeholder="············" />
          <FieldError />
        </TextField>
      </Form>
      <h2 className="text-xl font-medium mt-4">Passkeys</h2>
      <div className="flex flex-col gap-2">
        {authenticators.map((a) => (
          <div key={a.id} className="flex items-center gap-2">
            <img
              src={
                theme === "dark" ? a.provider.icon_dark : a.provider.icon_light
              }
              className="size-8"
              alt={a.provider.name}
            />
            <div>
              <div>{a.provider.name}</div>
              <small>Added on {a.createdAt.toLocaleDateString()}</small>
            </div>
          </div>
        ))}

        <Form
          method="POST"
          className="mt-4"
          onSubmit={handleFormSubmit(options)}
        >
          <input type="hidden" name="username" value={user.email} />
          <Button type="submit" name="intent" value="registration">
            Register New Passkey
          </Button>
        </Form>
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
