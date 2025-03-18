import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useRef, useState } from "react";
import { Icon } from "~/components/ui/icon";
import { Form, href, Link, redirect, useNavigation } from "react-router";
import type { Route } from ".react-router/types/app/routes/+types/sign-up";
import { Input } from "~/components/ui/textfield";
import { Label } from "~/components/ui/field";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import { adapterContext } from "~/utils/adapterContext";
import { type FileUpload, parseFormData } from "@mjackson/form-data-parser";
import { getSession } from "~/utils/sessionMiddleware";

const schema = z
  .object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
    passwordConfirmation: z.string(),
    image: z.union([z.instanceof(File), z.string()]).optional(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords don't match",
    path: ["passwordConfirmation"],
  });

export async function action({ context, request }: Route.ActionArgs) {
  const env = context.get(adapterContext);
  async function uploadHandler(fileUpload: FileUpload) {
    if (fileUpload.fieldName === "image") {
      const storageKey = `userImages/${crypto.randomUUID()}`;
      // @ts-expect-error Incorrect typing
      await env.r2.set(storageKey, fileUpload);
      return storageKey;
    }
  }
  const formData = await parseFormData(request, uploadHandler);
  const submission = parseWithZod(formData, { schema });

  if (submission.status === "success") {
    try {
      const result = await env.auth.api.signUpEmail({
        body: {
          name: submission.value.name,
          email: submission.value.email,
          password: submission.value.password,
          image: `/images/${submission.value.image}`,
        },
        asResponse: false,
      });
      const session = getSession(context, "user");
      session.set("user", result.user);
    } catch (error) {
      if (error instanceof Error) {
        return submission.reply({ formErrors: [error.message] });
      }
      return submission.reply({ formErrors: ["Error signing up."] });
    }
    throw redirect("/");
  }
  return submission.reply();
}

export default function SignUp({ actionData }: Route.ComponentProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const navigation = useNavigation();
  const loading = navigation.state !== "idle";

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
          method="POST"
          encType="multipart/form-data"
          className="grid gap-4"
          {...getFormProps(form)}
        >
          <div className="grid gap-2">
            <Label htmlFor={fields.name.id}>First name</Label>
            <Input
              placeholder="Max"
              required
              {...getInputProps(fields.name, { type: "text" })}
            />
          </div>
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
          <div className="grid gap-2">
            <Label htmlFor="image">Profile Image (optional)</Label>
            <div className="flex items-end gap-4">
              {imagePreview && (
                <div className="relative w-16 h-16 rounded-sm overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex items-center gap-2 w-full">
                <Input
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full"
                  {...getInputProps(fields.image, { type: "file" })}
                />
                {imagePreview && (
                  <Icon
                    name="X"
                    className="cursor-pointer"
                    onClick={() => {
                      if (imageRef.current) {
                        imageRef.current.value = "";
                      }
                      setImagePreview(null);
                    }}
                  />
                )}
              </div>
            </div>
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
