import { getSession } from "~/utils/sessionMiddleware";
import type { Route, Info } from "./+types/user";
import {
  data,
  isRouteErrorResponse,
  redirect,
  useFetcher,
  useNavigation,
  Form as RRForm,
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
import { useId, useState } from "react";
import { cn } from "~/utils/cn";
import { parseFormData, type FileUpload } from "@mjackson/form-data-parser";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import { profileUpdateSchema } from "~/utils/schemas";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { Form } from "~/components/ui/form";
import { hashPassword } from "~/utils/verifyPassword";

export const handle = {
  breadcrumb: (match: { data: { user: User }; params: Info["params"] }) => {
    if (!match.data) return { label: null };
    return { label: match.data.user.name || match.data.user.email };
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
  async function uploadHandler(fileUpload: FileUpload) {
    if (fileUpload.fieldName === "image") {
      const storageKey = `userImages/${crypto.randomUUID()}`;
      // @ts-expect-error Incorrect typing
      await env.r2.set(storageKey, fileUpload);
      return storageKey;
    }
  }
  const session = getSession(context, "user");
  const user = session.get("user");
  if (!user) throw redirect("/");
  const formData = await request.clone().formData();

  // Passkeys
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
        return {
          status: "error" as const,
          intent: undefined,
          initialValue: {},
          error: { "": [error.message] },
          state: undefined,
          fields: ["type", "response"],
        };
      }
      throw error;
    }
  }

  // Profile Photo
  if (formData.get("intent") === "image") {
    const formData = await parseFormData(request, uploadHandler);
    const image = `/images/${formData.get("image")}`;
    await env.db
      .updateTable("freestyle_user")
      .set("image", image)
      .where("id", "==", user.id)
      .executeTakeFirst();

    session.set("user", { ...user, image });
    return {
      status: "success" as const,
      intent: undefined,
      initialValue: {},
      error: undefined,
      state: undefined,
      fields: ["id"],
    };
  }

  // Normal Update
  if (formData.get("intent") === "update") {
    const submission = parseWithZod(formData, { schema: profileUpdateSchema });

    if (submission.status === "success") {
      if (submission.value.password) {
        const hashedPassword = await hashPassword(submission.value.password);

        await env.db
          .updateTable("freestyle_account")
          .set("password", hashedPassword)
          .where("userId", "==", user.id)
          .where("freestyle_account.providerId", "==", "credential")
          .execute();
      }

      // Check for existing emails
      if (submission.value.email && submission.value.email !== user.email) {
        const existing = await env.db
          .selectFrom("freestyle_user")
          .select("id")
          .where("email", "==", submission.value.email)
          .executeTakeFirst();

        if (existing)
          return submission.reply({
            fieldErrors: {
              email: ["Email is already in use by another user."],
            },
          });
      }

      const userUpdate = {
        ...(submission.value.email ? { email: submission.value.email } : {}),
        ...(submission.value.name ? { name: submission.value.name } : {}),
      };
      await env.db
        .updateTable("freestyle_user")
        .set(userUpdate)
        .where("id", "==", user.id)
        .execute();
      session.set("user", { ...user, ...userUpdate });
    }
    return submission.reply();
  }
}

export default function EditUser({
  params: { userId },
  loaderData: { user, options, authenticators },
  actionData,
}: Route.ComponentProps) {
  const theme = useTheme();
  const navigation = useNavigation();
  const updateSubmitting =
    navigation.state !== "idle" &&
    navigation.formData?.get("intent") === "update";

  const uploadFetcher = useFetcher();
  let src = user.image;
  if (
    uploadFetcher.state !== "idle" &&
    uploadFetcher.formData?.get("intent") === "image"
  ) {
    const image = uploadFetcher.formData.get("image");
    if (image && typeof image !== "string") {
      src = URL.createObjectURL(image);
    }
  }

  const [form, fields] = useForm({
    lastResult: actionData,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: profileUpdateSchema });
    },
    defaultValue: {
      name: user.name,
      email: user.email,
    },
  });

  console.log(form.allErrors);
  return (
    <div className="px-6">
      <h1 className="text-4xl font-medium">User Profile</h1>
      <UploadWell
        src={src}
        onChange={(files) => {
          const file = files[0];
          if (!file) return;
          const formdata = new FormData();
          formdata.set("image", file);
          formdata.set("intent", "image");
          uploadFetcher.submit(formdata, {
            method: "POST",
            encType: "multipart/form-data",
          });
        }}
      />
      <Form
        context={form.context}
        method="POST"
        className="max-w-md space-y-4"
        {...getFormProps(form)}
      >
        <TextField {...getInputProps(fields.name, { type: "text" })}>
          <Label>Name</Label>
          <Input placeholder="Alex" />
          <FieldError />
        </TextField>
        <TextField {...getInputProps(fields.email, { type: "email" })}>
          <Label>Email</Label>
          <Input placeholder="alex@freestylecms.com" />
          <FieldError />
        </TextField>
        <TextField {...getInputProps(fields.password, { type: "password" })}>
          <Label>Password</Label>
          <Input placeholder="············" />
          <FieldError />
        </TextField>
        <TextField
          {...getInputProps(fields.passwordConfirmation, { type: "password" })}
        >
          <Label>Password Confirmation</Label>
          <Input placeholder="············" />
          <FieldError />
        </TextField>
        <Button
          type="submit"
          name="intent"
          value="update"
          isPending={updateSubmitting}
        >
          {updateSubmitting ? (
            <Icon name="LoaderCircle" className="animate-spin" />
          ) : (
            "Update Profile"
          )}
        </Button>
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

        <RRForm
          method="POST"
          className="mt-4"
          onSubmit={handleFormSubmit(options)}
        >
          <input type="hidden" name="username" value={user.email} />
          <Button type="submit" name="intent" value="registration">
            Register New Passkey
          </Button>
        </RRForm>
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

function UploadWell({
  src,
  accept = "image/*",
  disabled,
  onChange,
  id = useId(),
}: {
  id?: string;
  src?: string | null;
  disabled?: boolean;
  accept?: string;
  onChange: (files: FileList) => void;
}) {
  const [dragging, setDragging] = useState(false);

  // Drag and drop is hard to test
  function handleDragEnter(e: React.DragEvent) {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    const acceptMatch = !accept || e.dataTransfer.items[0].type.match(accept);
    if (e.dataTransfer.items?.length === 1 && acceptMatch) {
      setDragging(true);
      e.dataTransfer.dropEffect = "copy";
    } else {
      setDragging(false);
      e.dataTransfer.dropEffect = "none";
    }
  }
  function handleDragExit(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const acceptMatch = !accept || e.dataTransfer.items[0].type.match(accept);

    if (disabled || !acceptMatch) return;
    setDragging(false);
    const files = e.dataTransfer.files;
    if (files?.length === 1) {
      onChange(files);
    }
  }

  return (
    <label
      className={cn(
        "block my-8 size-32 rounded-full overflow-hidden bg-background border border-muted",

        {
          "brightness-125 cursor-[copy]": !disabled && dragging,
          "cursor-pointer": !disabled && !dragging,
        }
      )}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragEnter}
      onDragLeave={handleDragExit}
      onDragEnd={handleDragExit}
      onDrop={handleDrop}
      htmlFor={id}
    >
      {src ? (
        <img src={src} alt="User" className="size-full" />
      ) : (
        <Icon className="size-full" name="User" />
      )}
      <input
        id={id}
        type="file"
        hidden
        accept={accept}
        multiple={false}
        value={""}
        disabled={disabled}
        onChange={(e) => {
          if (e.target?.files?.length === 1) {
            onChange(e.target.files);
          }
        }}
      />
    </label>
  );
}
